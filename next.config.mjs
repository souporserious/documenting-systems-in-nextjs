import withRemoteRefresh from 'next-remote-refresh'
import * as path from 'path'

const componentsDirectory = path.resolve(process.cwd(), './components')

export default withRemoteRefresh({
  paths: [componentsDirectory],
})()
