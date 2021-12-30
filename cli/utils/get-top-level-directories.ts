import { project } from '../project'

export function getTopLevelDirectories() {
  const allDirectories = project.getDirectories().filter((directory) => {
    const directoryPath = directory.getPath()
    return directoryPath !== process.cwd() && !directoryPath.includes('.data')
  })
  return new Set(
    allDirectories.map((directory) => {
      return directory.getPath().replace(`${process.cwd()}/`, '').split('/')[0]
    })
  )
}
