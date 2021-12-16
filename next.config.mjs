import withRemoteRefresh from 'next-remote-refresh'

const componentsDirectory = process.cwd() + '/components'
const hooksDirectory = process.cwd() + '/hooks'
const utilsDirectory = process.cwd() + '/utils'

export default withRemoteRefresh({
  paths: [componentsDirectory, hooksDirectory, utilsDirectory],
})({
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    // Disable NextJS normal WASM loading pipeline so onigasm can load properly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[modulehash].wasm',
      },
    })
    return config
  },
})
