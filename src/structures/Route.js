const Utils = require('../utils')

const Route = class {
  constructor (opts, server) {
    const options = Utils.createOptionHandler('Route', opts)

    this.name = options.required('name')
    this.server = server
  }

  get path () {
    return `/api/${this.name}`
  }

  register () {}
}

module.exports = Route
