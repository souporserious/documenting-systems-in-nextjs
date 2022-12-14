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
    // Tree shake barrel exports
    config.module.rules.push({
      test: [/(components|hooks|theme|utils)\/index.ts/i],
      sideEffects: false,
    })

    return config
  },
})
