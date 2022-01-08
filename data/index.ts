import chokidar from 'chokidar'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { getComponents } from './get-components'
import { getHooks } from './get-hooks'
import { getUtils } from './get-utils'
import { componentsSourceFile, hooksSourceFile, project } from './project'

const DEBUG = process.argv.includes('--debug')
const cacheDirectory = '.data'

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory)
}

async function writeComponentsData() {
  const components = await getComponents()

  if (DEBUG) {
    console.log('writing components to cache...')
  }

  writeFileSync(
    `${cacheDirectory}/components.ts`,
    `export const allComponents = ${JSON.stringify(components, null, 2)}`
  )
}

async function writeHooksData() {
  const hooks = await getHooks()

  if (DEBUG) {
    console.log('writing hooks to cache...')
  }

  writeFileSync(
    `${cacheDirectory}/hooks.ts`,
    `export const allHooks = ${JSON.stringify(hooks, null, 2)}`
  )
}

async function writeUtilsData() {
  const utils = await getUtils()

  if (DEBUG) {
    console.log('writing utils to cache...')
  }

  writeFileSync(
    `${cacheDirectory}/utils.ts`,
    `export const allUtils = ${JSON.stringify(utils, null, 2)}`
  )
}

async function writeTypesData() {
  const result = project.emitToMemory()
  const declarationFiles = result.getFiles().map((file) => ({
    path: file.filePath.replace(process.cwd(), 'file:///node_modules'),
    code: file.text,
  }))

  if (DEBUG) {
    console.log('writing types to cache...')
  }

  writeFileSync(
    `${cacheDirectory}/types.ts`,
    `export const allTypes = ${JSON.stringify(declarationFiles, null, 2)}`
  )
}

async function writeData() {
  await writeComponentsData()
  await writeHooksData()
  await writeUtilsData()
  await writeTypesData()

  /** Create a barrel export for each data set. */
  writeFileSync(
    `${cacheDirectory}/index.ts`,
    ['components', 'hooks', 'utils', 'types']
      .map((name) => `export * from './${name}'`)
      .join('\n')
  )
}

const start = performance.now()
if (DEBUG) {
  console.log('start gathering data...')
}

writeData().then(() => {
  if (DEBUG) {
    console.log(
      `finished gathering data in ${(
        (performance.now() - start) /
        1000
      ).toFixed(2)}s`
    )
  }
})

if (process.argv.includes('--watch')) {
  const watcher = chokidar.watch([
    componentsSourceFile.getDirectoryPath() + '/**/*.(ts|tsx|mdx)',
    hooksSourceFile.getDirectoryPath() + '/**/*.(ts|tsx|mdx)',
  ])

  /**
   * Listen for 'add' events after watcher is ready otherwise we get callbacks
   * for every path that was added.
   */
  watcher.on('ready', function () {
    if (DEBUG) {
      console.log('watching for changes...')
    }

    watcher.on('add', async function (addedPath) {
      if (DEBUG) {
        console.log('adding path to project: ', addedPath)
      }
      if (!addedPath.includes('mdx')) {
        project.addSourceFileAtPath(addedPath)
      }
      await writeData()
    })

    watcher.on('unlink', async function (removedPath) {
      if (DEBUG) {
        console.log('removing path from project: ', removedPath)
      }
      if (!removedPath.includes('mdx')) {
        const removedSourceFile = project.getSourceFile(removedPath)
        if (removedSourceFile) {
          project.removeSourceFile(removedSourceFile)
        }
      }
      await writeData()
    })
  })

  watcher.on('change', async function (changedPath) {
    if (!changedPath.includes('mdx')) {
      const changedSourceFile = project.getSourceFile(changedPath)
      if (changedSourceFile) {
        if (DEBUG) {
          console.log('refreshing: ', changedPath)
        }
        await changedSourceFile.refreshFromFileSystem()
      } else if (DEBUG) {
        console.log('unable to refresh: ', changedPath)
      }
    } else if (DEBUG) {
      console.log('changed path: ', changedPath)
    }

    const start = performance.now()
    if (DEBUG) {
      console.log('start gathering data...')
    }

    await writeData()

    if (DEBUG) {
      console.log(
        `finished updating data in ${(
          (performance.now() - start) /
          1000
        ).toFixed(2)}s`
      )
    }
  })
}
