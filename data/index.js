const { register } = require('esbuild-register/dist/node')
register({ target: 'node12' })
module.exports = require('./generate-data')
