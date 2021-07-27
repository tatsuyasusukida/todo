const path = require('path')
const puppeteer = require('puppeteer')
const fsExtra = require('fs-extra')

class Main {
  async run () {
    const browser = await puppeteer.launch()

    try {
      const page = await browser.newPage()
      const tasks = [
        ['/todo/','todo/index.png'],
        ['/todo/add/','todo/add.png'],
        ['/todo/add/finish/','todo/add-finish.png'],
        ['/todo/1/','todo/view.png'],
        ['/todo/1/edit/','todo/edit.png'],
        ['/todo/1/edit/finish/','todo/edit-finish.png'],
        ['/todo/1/delete/','todo/delete.png'],
        ['/todo/delete/finish/','todo/delete-finish.png'],
      ]

      await page.setViewport({width: 700, height: 1000})

      for (const task of tasks) {
        const [pathname, filename] = task
        const url = 'http://127.0.0.1:3000' + pathname
        const destination = path.join(__dirname, '../dist/img', filename)

        await fsExtra.mkdirp(path.dirname(destination))
        await page.goto(url)
        await page.screenshot({path: destination})
      }
    } finally {
      await browser.close()
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
    console.debug(err.stack)
  }
}
