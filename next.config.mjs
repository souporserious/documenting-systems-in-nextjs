import withRemoteRefresh from 'next-remote-refresh'
import * as path from 'path'

const componentsDirectory = path.resolve(process.cwd(), './components')
const hooksDirectory = path.resolve(process.cwd(), './hooks')
const utilsDirectory = path.resolve(process.cwd(), './utils')

export default withRemoteRefresh({
  paths: [componentsDirectory, hooksDirectory, utilsDirectory],
})({
  typescript: {
    ignoreBuildErrors: true,
  },
})
