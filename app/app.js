const path = require('path')
const morgan = require('morgan')
const express = require('express')
const model = require('./model')
const {Op} = model.Sequelize

class App {
  constructor () {
    this.router = express()

    this.router.set('strict routing', true) // <1>
    this.router.set('views', path.join(__dirname, 'view'))
    this.router.set('view engine', 'pug')

    this.router.use(morgan('dev')) // <2>

    this.router.get('/', (req, res) => res.redirect('./todo/')) // <3>
    this.router.get('/todo/', this.onRequestTodoIndex.bind(this))
    this.router.get('/todo/', (req, res) => res.render('todo/index'))
    this.router.get('/todo/add/', this.onRequestTodoAddGet.bind(this))
    this.router.get('/todo/add/', (req, res) => res.render('todo/add'))
    this.router.post('/todo/add/', express.urlencoded({extended: false}))
    this.router.post('/todo/add/', this.onRequestTodoAddPost.bind(this))
    this.router.post('/todo/add/', (req, res) => res.render('todo/add'))
    this.router.get('/todo/add/finish/', this.onRequestTodoAddFinish.bind(this))
    this.router.get('/todo/add/finish/', (req, res) => res.render('todo/add-finish'))
    this.router.use('/todo/:todoId([0-9]+)/', this.onRequestFindTodo.bind(this))
    this.router.get('/todo/:todoId([0-9]+)/', this.onRequestTodoView.bind(this))
    this.router.get('/todo/:todoId([0-9]+)/', (req, res) => res.render('todo/view'))
    this.router.get('/todo/:todoId([0-9]+)/edit/', this.onRequestTodoEditGet.bind(this))
    this.router.get('/todo/:todoId([0-9]+)/edit/', (req, res) => res.render('todo/edit'))
    this.router.post('/todo/:todoId([0-9]+)/edit/', express.urlencoded({extended: false}))
    this.router.post('/todo/:todoId([0-9]+)/edit/', this.onRequestTodoEditPost.bind(this))
    this.router.post('/todo/:todoId([0-9]+)/edit/', (req, res) => res.render('todo/edit'))
    this.router.get('/todo/:todoId([0-9]+)/edit/finish/', (req, res) => res.render('todo/edit-finish'))
    this.router.get('/todo/:todoId([0-9]+)/delete/', (req, res) => res.render('todo/delete'))
    this.router.post('/todo/:todoId([0-9]+)/delete/', this.onRequestTodoDelete.bind(this))
    this.router.get('/todo/delete/finish/', (req, res) => res.render('todo/delete-finish'))

    this.router.use((req, res) => { // <4>
      res.status(404).end()
    })

    this.router.use((err, req, res, next) => { // <5>
      res.status(500).end()
      this.onError(err)
    })
  }

  onRequest (req, res) { // <6>
    this.router(req, res)
  }

  async onRequestFindTodo (req, res, next) {
    try {
      const todo = await model.todo.findOne({
        where: {
          id: {[Op.eq]: req.params.todoId},
        },
        order: [['date', 'desc']],
      })

      if (todo) {
        req.todo = todo
        next()
      } else {
        res.status(404).end()
      }
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoView (req, res, next) {
    try {
      res.locals.todo = {
        content: req.todo.content,
        date: req.todo.date,
        dateText: this.convertDate(req.todo.date),
      }

      next()
    } catch (err) {
      next(err)
    }
  }

  convertDate (date) {
    const offset = 9 * 60 * 60 * 1000
    const offsetDate = new Date(date.getTime() + offset)
    const year = offsetDate.getUTCFullYear()
    const month = offsetDate.getUTCMonth() + 1
    const day = offsetDate.getUTCDate()
    const dayOfTheWeek = '日月火水木金土日'[offsetDate.getUTCDay()]
    const hour = offsetDate.getUTCHours()
    const minute = offsetDate.getUTCMinutes()
    const second = offsetDate.getUTCSeconds()
    const datePart = `${year}年${month}月${day}日 (${dayOfTheWeek}曜日)`
    const timePart = `${hour}時${minute}分${second}秒`

    return datePart + ' ' + timePart
  }

  async onRequestTodoAddGet (req, res, next) {
    try {
      res.locals.form = {content: ''}
      next()
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoAddFinish (req, res, next) {
    try {
      res.locals.todoId = req.query.todoId
      next()
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoAddPost (req, res, next) {
    try {
      const form = {content: req.body.content}
      const validation = {content: req.body.content !== ''}

      if (validation.content) {
        const todo = await model.todo.create({
          date: new Date(),
          content: form.content,
        })

        res.redirect('./finish/?todoId=' + todo.id)
      } else {
        res.locals.form = form
        res.locals.validation = validation
        next()
      }
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoEditGet (req, res, next) {
    try {
      res.locals.form = {
        content: req.todo.content,
      }

      next()
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoEditPost (req, res, next) {
    try {
      const form = {
        content: req.body.content,
      }

      const validation = {
        content: req.body.content !== '',
      }

      if (validation.content) {
        req.todo.content = form.content
        await req.todo.save()
        res.redirect('./finish/')
      } else {
        res.locals.form = form
        res.locals.validation = validation
        next()
      }
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoDelete (req, res, next) {
    try {
      await req.todo.destroy()
      res.redirect('../../delete/finish/')
    } catch (err) {
      next(err)
    }
  }

  async onRequestTodoIndex (req, res, next) {
    try {
      res.locals.todos = await model.todo.findAll({
        order: [['date', 'desc']],
      })

      next()
    } catch (err) {
      next(err)
    }
  }

  onError (err) { // <7>
    console.error(err.message)
    console.debug(err.stack)
  }
}

module.exports.App = App
