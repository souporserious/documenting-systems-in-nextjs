import chokidar from 'chokidar'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { getComponents } from './get-components'
import { getDocs } from './get-docs'
import { getPageLinks } from './get-page-links'
import { getHooks } from './get-hooks'
import { getUtils } from './get-utils'
import {
  componentsSourceFile,
  hooksSourceFile,
  project,
  utilsSourceFile,
} from './project'

const DEBUG = process.argv.includes('--debug')
const cacheDirectory = '.data'

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory)
}

async function writeComponentsData() {
  const allComponents = await getComponents()

  if (DEBUG) {
    console.log(
      `writing ${allComponents.reduce(
        (total, component) => total + component.types.length,
        0
      )} components to cache...`
    )
  }

  writeFileSync(
    `${cacheDirectory}/components.ts`,
    `export const allComponents = ${JSON.stringify(allComponents, null, 2)}`
  )

  return allComponents
}

async function writeHooksData() {
  const allHooks = await getHooks()

  if (DEBUG) {
    console.log(`writing ${allHooks.length} hooks to cache...`)
  }

  writeFileSync(
    `${cacheDirectory}/hooks.ts`,
    `export const allHooks = ${JSON.stringify(allHooks, null, 2)}`
  )

  return allHooks
}

async function writeUtilsData() {
  const allUtils = await getUtils()

  if (DEBUG) {
    console.log(`writing ${allUtils.length} utils to cache...`)
  }

  writeFileSync(
    `${cacheDirectory}/utils.ts`,
    `export const allUtils = ${JSON.stringify(allUtils, null, 2)}`
  )

  return allUtils
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

async function writeDocsData() {
  const allDocs = await getDocs()

  if (DEBUG) {
    console.log(`writing ${allDocs.length} docs to cache...`)
  }

  writeFileSync(
    `${cacheDirectory}/docs.ts`,
    `export const allDocs = ${JSON.stringify(allDocs, null, 2)}`
  )

  return allDocs
}

async function writeData() {
  const allPageLinks = getPageLinks()
  const allComponents = await writeComponentsData()
  const allDocs = await writeDocsData()
  const allHooks = await writeHooksData()
  const allUtils = await writeUtilsData()
  const allLinks = {
    Components: allComponents.map((component) => ({
      name: component.name,
      slug: `/components/${component.slug}`,
    })),
    Docs: allDocs.map((doc) => ({
      name: doc.name,
      slug: `/docs/${doc.slug}`,
    })),
    Hooks: allHooks.map((hook) => ({
      name: hook.name,
      slug: `/hooks/${hook.slug}`,
    })),
    Utils: allUtils.map((util) => ({
      name: util.name,
      slug: `/utils/${util.slug}`,
    })),
    ...allPageLinks,
  }

  /** Generate types for Monaco Editor. */
  await writeTypesData()

  /** Create links for each data set. This keeps the client import lightweight. */
  writeFileSync(
    `${cacheDirectory}/links.ts`,
    `export const allLinks = ${JSON.stringify(allLinks, null, 2)}`
  )

  /** Create a barrel export for each data set. */
  writeFileSync(
    `${cacheDirectory}/index.ts`,
    ['components', 'hooks', 'utils', 'links', 'types']
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
    `${componentsSourceFile.getDirectoryPath()}/**/*.(ts|tsx|mdx)`,
    `${hooksSourceFile.getDirectoryPath()}/**/*.(ts|tsx|mdx)`,
    `${utilsSourceFile.getDirectoryPath()}/**/*.(ts|tsx|mdx)`,
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
