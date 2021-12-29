import withRemoteRefresh from 'next-remote-refresh'

const dataDirectory = process.cwd() + '/.data'

export default withRemoteRefresh({
  paths: [dataDirectory],
})({
  experimental: {
    styledComponents: true,
  },
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
