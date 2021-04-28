const { Route, Endpoint } = require('../')
const { Router } = require('express')

const { QueryTypes: { SELECT } } = require('sequelize')

const UsersRoute = class extends Route {
  constructor(server) {
    super({
      name: 'users'
    }, server)
  }

  register() {
    const router = Router()

    /**
    * @method - GET
    * @endpoint - /api/users
    * Retorna erro - Bad Request código 400
    */
    router.get('/', (_req, res) => {
      res.status(400).json({ ok: false, erro: 'O id de usuário não foi fornecido. Consulte a documentação.' })
    })

    /**
    * @method - GET
    * @endpoint - /api/users/:user_id
    * Retorna o registro de acordo com o id fornecido no endpoint
    */
    router.get('/:user_id', Endpoint.authenticate(this.server), async (req, res) => {
      const { user_id } = req.params

      const [user] = await this.server.db.query(
        'SELECT first_name, last_name, email, document_cpf, document_cnpj, id FROM users WHERE id = $user_id',
        { bind: { user_id }, type: SELECT }
      )

      if (!user) return res.status(404).json({ ok: false, erro: 'Não encontrei resultados para o id fornecido' })
      res.status(200).json({ ok: true, user })
    })

    this.server.app.use(this.path, router)
    return true
  }
}

module.exports = UsersRoute

/**
* Table: users
* Realizar a busca pela coluna user_id
* listar as seguintes colunas: first_name, last_name, email, document_cpf, document_cnpj, unique_id
*/
