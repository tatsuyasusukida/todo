const model = require('../model')

class Main {
  async run () {
    try {
      await model.sequelize.sync({force: true})
      await model.todo.bulkCreate([
        {
          date: Date.now() - 2 * 24 * 60 * 60 * 1000,
          content: 'ここにToDoの内容が入ります1',
        },
        {
          date: Date.now() - 1 * 24 * 60 * 60 * 1000,
          content: 'ここにToDoの内容が入ります2',
        },
        {
          date: Date.now(),
          content: 'ここにToDoの内容が入ります3',
        },
      ])
    } finally {
      await model.sequelize.close()
    }
  }
}

if (require.main === module) {
  main()
}

async function main () {
  try {
    await new Main().run()
  } catch (err) {
    console.error(err.message)
    console.error(err.stack)
  }
}
