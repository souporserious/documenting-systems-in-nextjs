import withRemoteRefresh from 'next-remote-refresh'

const dataDirectory = process.cwd() + '/.data'

export default withRemoteRefresh({
  paths: [dataDirectory],
})({
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    // Disable NextJS normal WASM loading pipeline so onigasm can load properly
    config.module.rules.push({
      test: /onigasm\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/onigasm.wasm',
      },
    })

    // Tree shake barrel exports
    config.module.rules.push({
      test: [/(components|hooks|theme|utils)\/index.ts/i],
      sideEffects: false,
    })

    return config
  },
})
