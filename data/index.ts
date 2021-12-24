import chokidar from 'chokidar'
import { existsSync, mkdirSync, promises as fs } from 'fs'
import { performance } from 'perf_hooks'
import { getComponents } from './get-components'
import { getHooks } from './get-hooks'
import { componentsSourceFile, hooksSourceFile, project } from './project'

const DEBUG = process.argv.includes('--debug')
const cacheDirectory = '.data'

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory)
}

async function writeComponentsData() {
  const components = await getComponents()

  if (DEBUG) {
    console.log('writing data to cache: ', components)
  }

  fs.writeFile(
    `${cacheDirectory}/components.ts`,
    `export const allComponents = ${JSON.stringify(components, null, 2)}`
  )
}

async function writeHooksData() {
  const hooks = await getHooks()

  if (DEBUG) {
    console.log('writing hooks to cache: ', hooks)
  }

  fs.writeFile(
    `${cacheDirectory}/hooks.ts`,
    `export const allHooks = ${JSON.stringify(hooks, null, 2)}`
  )
}

async function writeTypesData() {
  const result = project.emitToMemory()
  const declarationFiles = result.getFiles().map((file) => ({
    path: file.filePath.replace(process.cwd(), 'file:///node_modules'),
    code: file.text,
  }))

  if (DEBUG) {
    console.log('writing types to cache: ', declarationFiles)
  }

  fs.writeFile(
    `${cacheDirectory}/types.ts`,
    `export const allTypes = ${JSON.stringify(declarationFiles, null, 2)}`
  )
}

async function writeData() {
  await writeComponentsData()
  await writeHooksData()
  await writeTypesData()
  await fs.writeFile(
    `${cacheDirectory}/index.ts`,
    ['components', 'hooks', 'types']
      .map((name) => `export * from './${name}'`)
      .join('\n')
  )
}

const start = performance.now()
if (DEBUG) {
  console.log('start gathering initial hooks: ', start)
}

writeData().then(() => {
  if (DEBUG) {
    console.log('finished gathering initial hooks: ', performance.now() - start)
  }
})

if (process.argv.includes('--watch')) {
  const watcher = chokidar.watch([
    componentsSourceFile.getDirectoryPath() + '/**/*.(ts|tsx)',
    hooksSourceFile.getDirectoryPath() + '/**/*.(ts|tsx)',
  ])

  /**
   * Listen for 'add' events after watcher is ready otherwise we get callbacks
   * for every path that was added.
   */
  watcher.on('ready', function () {
    watcher.on('add', async function (addedPath) {
      if (DEBUG) {
        console.log('adding path to project: ', addedPath)
      }
      project.addSourceFileAtPath(addedPath)
      await writeData()
    })

    watcher.on('remove', async function (removedPath) {
      if (DEBUG) {
        console.log('removing path from project: ', removedPath)
      }
      project.removeSourceFile(removedPath)
      await writeData()
    })
  })

  watcher.on('change', async function (changedPath) {
    const changedSourceFile = project.getSourceFile(changedPath)
    if (changedSourceFile) {
      if (DEBUG) {
        console.log('refreshing: ', changedPath)
      }
      await changedSourceFile.refreshFromFileSystem()
    } else if (DEBUG) {
      console.log('unable to refresh: ', changedPath)
    }

    const start = performance.now()
    if (DEBUG) {
      console.log('start gathering updated hooks: ', start)
    }

    await writeData()

    if (DEBUG) {
      console.log('end gathering updated hooks: ', performance.now() - start)
    }
  })
}
