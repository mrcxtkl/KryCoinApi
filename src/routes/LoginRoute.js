const { Route } = require('../')
const { Router } = require('express')

const { QueryTypes: { SELECT } } = require('sequelize')
const jwt = require('jsonwebtoken')

const LoginRoute = class extends Route {
  constructor(server) {
    super({
      name: 'login'
    }, server)
  }

  register() {
    const router = Router()

    /**
    * @method - GET
    * @endpoint - /api/login
    * @content - application/json
    * Enviar o email e o hash_api do utilizador da API para adquirir um token de acesso
    */
    router.get('/', async (req, res) => {
      const { email, hash_api } = req.body

      if (!email || !hash_api) {
        return res.status(400).json({ ok: false, erro: 'Faltam informações para completar a requisição' })
      }

      try {
        const [record] = await this.server.db.query(
          'SELECT level, COUNT(*) AS count FROM users WHERE email = $email AND hash_api = $hash_api',
          { bind: { email, hash_api }, type: SELECT }
        )

        if (!record.count)  return res.status(400).json({ ok: false, erro: 'Informações inválidas foram fornecidas' })
        if (record.level === 1) return res.status(401).json({ ok: false, erro: 'Você não está autorizado para realizar essa ação' })

        return res.status(200).json({
          ok: true,
          token: jwt.sign({
            email,
            hash_api
          }, process.env.JWT_SECRET)
        })
      } catch (e) {
        this.server.log(e, { tags: ['Route', this.server.cptlz(this.name)], options: ['red'] })
        return res.status(500).json({ ok: false, erro: 'Um erro interno impossibilitou que sua requisição fosse terminada' })
      }
    })

    this.server.app.use(this.path, router)
    return true
  }
}

module.exports = LoginRoute
