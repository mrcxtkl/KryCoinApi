const { Route, Endpoint } = require('../')
const { Router } = require('express')

const { QueryTypes: { SELECT } } = require('sequelize')

const WalletsRoute = class extends Route {
  constructor(server) {
    super({
      name: 'wallets'
    }, server)
  }

  register() {
    const router = Router()

    /**
    * @method - GET
    * @endpoint - /api/wallets
    * Retorna erro - Bad Request código 400
    */
    router.get('/', Endpoint.authenticate(this.server), (_req, res) => {
      res.status(400).json({ ok: false, erro: 'O wallet_hash não foi fornecido. Consulte a documentação.' })
    })

    /**
    * @method - GET
    * @endpoint - /api/wallets/:wallet_hash
    * Retorna o registro de acordo com o hash fornecido no endpoint
    */
    router.get('/:wallet_hash', Endpoint.authenticate(this.server), async (req, res) => {
      const { wallet_hash } = req.params

      const [wallet] = await this.server.db.query(
        'SELECT balance_kry, balance_real, wallet_hash FROM wallets WHERE wallet_hash = $wallet_hash',
        { bind: { wallet_hash }, type: SELECT }
      )

      if (!wallet) return res.status(404).json({ ok: false, erro: 'Não encontrei resultados para o wallet_hash fornecido' })
      res.status(200).json({ ok: true, wallet })
    })


    /* router.patch('/:wallet_hash', Endpoint.authenticate(this.server), async (req, res) => {
      // Colunas da tabela que podem ser atualizadas
      const allowedUpdate = ['balance_kry']
      const deniedColumns = Object.keys(req.body).reduce((acc, key) => !allowedUpdate.includes(key) ? [...acc, key] : acc, [])

      if (deniedColumns.length) return res.status(400).json({
        ok: false,
        erro: 'Alguma (as) das colunas enviadas não podem ser alteradas',
        deniedColumns
      })

      const { wallet_hash } = req.params
      const querySetters = Object.entries(req.body).map(([key, value]) => `SET ${key} = ${value}`).join(', ')

      try{
        const [result, metadata] = await this.server.db.query(`UPDATE wallets ${querySetters} WHERE wallet_hash = ${wallet_hash}`)
        res.status(200).json({ ok:true, rows: metadata.affectedRows, info: metadata.info })
      } catch (e) {
        server.log(e, { tags: ['WalletsRoute.patch'], options: ['red'] })
        return res.status(500).json({ ok: false, erro: 'Um erro interno ocorreu' })
      }
    })
    */

    this.server.app.use(this.path, router)
    return true
  }
}

module.exports = WalletsRoute

/**
* Table: wallets
* Realizar a busca pela coluna wallet_hash
* listar as seguintes colunas: balance_kry, balance_real, wallet_hash
*/
