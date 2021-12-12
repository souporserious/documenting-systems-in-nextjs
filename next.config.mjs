import withRemoteRefresh from 'next-remote-refresh'
import * as path from 'path'

const componentsDirectory = path.resolve(process.cwd(), './components')
const utilsDirectory = path.resolve(process.cwd(), './utils')

export default withRemoteRefresh({
  paths: [componentsDirectory, utilsDirectory],
})({
  typescript: {
    ignoreBuildErrors: true,
  },
})
