const jwt = require('jsonwebtoken')
const { QueryTypes: { SELECT } } = require('sequelize')

const Endpoint = class {
  static authenticate(server, minLevel = 2) {
    return async (req, res, next) => {
      const token = req.get('Authorization')
      if (!token) return res.status(400).json({ ok: false, erro: 'Um token de autorização não foi fornecido' })

      try {
        const { email, hash_api } = jwt.verify(token, process.env.JWT_SECRET)

        const [record] = await server.db.query(
          'SELECT level FROM users WHERE email = $email AND hash_api = $hash_api',
          { bind: { email, hash_api }, type: SELECT }
        )

        if (record && record.level >= minLevel) return next()
      } catch (e) {
        // JWT Exception para token inválido - server.log(e, { tags: ['Endpoint.authenticate'], options: ['red'] })
        return res.status(401).json({ ok: false, erro: 'Um token de acesso inválido foi fornecido' })
      }
    }
  }
}

module.exports = Endpoint
