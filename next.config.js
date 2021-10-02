const withRemoteRefresh = require('next-remote-refresh')({
  paths: [require('path').resolve(__dirname, './components')],
})

module.exports = withRemoteRefresh()
