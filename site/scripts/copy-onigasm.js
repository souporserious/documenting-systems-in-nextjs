const fs = require('fs')
const path = require('path')

const lib = path.join(__dirname, '../node_modules/onigasm/lib/onigasm.wasm')
const public = path.join(__dirname, '../public/onigasm.wasm')

/** Copy onigasm wasm bin so we can load through fetch instead of Webpack. */
fs.copyFileSync(lib, public)
