const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const chalk = require('chalk')

const { readdirSync } = require('fs')
const { Sequelize } = require('sequelize')

const Server = class {
  constructor() {
    this.app = express()
    this.db = null


    this.ckfy = (m, o) => o.reduce((a, v) => (typeof a === 'function' ? a[v] : chalk[v]), [])(m)
    this.cptlz = str => str[0].toUpperCase() + str.slice(1)

    this.initializeDB()
    this.initializeHTTPServer()
  }


  log(message, { tags = [], options = ['white'] } = {}) {
    console.log(...tags.map(t => chalk.cyan.bold(`[${t}]`)), this.ckfy(message, options))
  }

  async initializeDB(uri = process.env.DB_URI) {
    this.db = new Sequelize(uri, {
      logging: (...msg) => this.log(msg, { tags: ['DB'] })
    })

    this.db.authenticate()
      .then(() => this.log('Conexão estabelecida', { tags: ['DB'] }))
      .catch(e => this.log(e, { tags: ['DB'], options: ['red'] }))
  }

  initializeHTTPServer(port = process.env.PORT || 3000) {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(morgan(`${chalk.cyan('[HTTP]')} ${chalk.green(':method :url - IP :remote-addr - Code :status - Size :res[content-length] B - Handled in :response-time ms')}`))

    this.app.listen(port, () => this.log(`Servidor iniciado na porta ${chalk.bold(port)}`, { tags: ['HTTP', 'Server'] }))
    return this.initializeRoutes()
  }

  initializeRoutes(dirPath = './src/routes') {
    const routes = readdirSync(dirPath).map(R => new (require(`./routes/${R}`))(this))

    for (const R of routes) {
      const done = this.addRoute(R)
      if (!done) return this.log(`Ocorreu um erro ao atribuir a rota ${chalk.bold(R.path)} `, { tags: ['HTTP', 'Route'], options: ['red'] })

      this.log(`Rota ${chalk.bold(R.path)} atribuída`, { tags: ['HTTP', 'Route'] })
    }
  }

  addRoute(route) {
    try {
      route.register()
      return true
    } catch (e) {
      this.log(e, { tags: ['Erro'], options: ['red'] })
    }
    return false
  }
}

module.exports = Server
