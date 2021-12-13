import { promises as fs, existsSync, mkdirSync, readdirSync } from 'fs'
import * as path from 'path'
import { Project, Node } from 'ts-morph'
import { camelCase } from 'case-anything'
import { transformCode } from './transform-code'
import chokidar from 'chokidar'
import { performance } from 'perf_hooks'

const hooksDirectory = path.resolve(process.cwd(), 'hooks')
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
})
const hooks = readdirSync(hooksDirectory).filter(
  (file) => !file.startsWith('index')
)
const sourcePath = path.resolve(process.cwd(), hooksDirectory, 'index.ts')
const sourceFile = project.getSourceFile(sourcePath)

export async function getHooks() {
  let docs = {}

  sourceFile.getExportedDeclarations().forEach(([declaration]) => {
    if (Node.isFunctionDeclaration(declaration)) {
      const [doc] = declaration.getJsDocs()

      if (doc) {
        docs[declaration.getName()] = {
          description: doc.getComment(),
          examples: doc
            .getTags()
            .filter((tag) => tag.getTagName() === 'example')
            .map((tag) => tag.getCommentText()),
        }
      }
    }
  })

  return Promise.all(
    hooks.map(async (fileName) => {
      const extension = path.extname(fileName).slice(1)
      const name = path.basename(fileName, `.${extension}`)
      const doc = docs[camelCase(name)]
      const hookPath = path.resolve(hooksDirectory, fileName)
      let hookExamples = doc.examples

      if (hookExamples) {
        const compiledExamples = await Promise.all(
          hookExamples.map((codeString) => {
            const reactImport = `import React from 'react'\n`
            return transformCode(reactImport + codeString)
          })
        )
        hookExamples = hookExamples.map((codeString, index) => ({
          code: codeString,
          compiledCode: compiledExamples[index],
        }))
      } else {
        hookExamples = null
      }

      const hookData = {
        name: camelCase(name),
        slug: name,
        path: null,
        description: doc.description,
        examples: hookExamples,
      }

      // if (process.env.NODE_ENV === 'development') {
      hookData.path = hookPath
      // }

      return hookData
    })
  )
}

export async function writeHooks() {
  const hooks = await getHooks()
  if (DEBUG) {
    console.log('writing hooks to cache: ', hooks)
  }
  fs.writeFile(`${cacheDirectory}/hooks.json`, JSON.stringify(hooks))
}

const DEBUG = true
const cacheDirectory = '.cache'

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory)
}

const watcher = chokidar.watch(hooksDirectory + '/**/*.(ts|tsx)')

watcher.on('change', async function (changedPath) {
  if (DEBUG) {
    console.log('refreshing: ', changedPath)
  }
  await project.getSourceFile(changedPath).refreshFromFileSystem()

  const start = performance.now()
  if (DEBUG) {
    console.log('start gathering updated hooks: ', start)
  }

  await writeHooks()

  if (DEBUG) {
    console.log('end gathering updated hooks: ', performance.now() - start)
  }
})

const start = performance.now()
if (DEBUG) {
  console.log('start gathering initial hooks: ', start)
}

writeHooks().then(() => {
  if (DEBUG) {
    console.log('finished gathering initial hooks: ', performance.now() - start)
  }
})
