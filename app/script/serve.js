const http = require('http')
const {App} = require('../app')

class Main {
  async run () {
    const server = http.createServer()
    const app = new App()

    server.on('request', app.onRequest.bind(app))
    server.on('error', app.onError.bind(app))
    server.listen(process.env.PORT || '3000')
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
