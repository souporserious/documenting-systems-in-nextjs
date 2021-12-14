import { promises as fs, existsSync, mkdirSync, readdirSync } from 'fs'
import * as path from 'path'
import { Project, Node } from 'ts-morph'
import { camelCase, kebabCase } from 'case-anything'
import { transformCode } from './transform-code.js'
import { getComponentExamples } from './get-component-examples.js'
import { getComponentReadme } from './get-component-readme.js'
import chokidar from 'chokidar'
import { performance } from 'perf_hooks'

const hooksDirectory = path.resolve(process.cwd(), 'hooks')
const hooks = readdirSync(hooksDirectory).filter(
  (file) => !file.startsWith('index')
)
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
})
const componentsSourceFile = project.getSourceFile('components/index.ts')
const hooksSourceFile = project.getSourceFile('hooks/index.ts')

export function getComponentTypes(declaration) {
  const [props] = declaration.getParameters()
  const type = props.getType()
  return type.getProperties().map((prop) => {
    const [propDeclaration] = prop.getDeclarations()
    const [commentRange] = propDeclaration.getLeadingCommentRanges()
    return {
      name: prop.getName(),
      type: prop.getTypeAtLocation(declaration).getText(),
      comment: commentRange?.getText() || null,
    }
  })
}

export async function getComponents() {
  const exportedDeclarations = componentsSourceFile.getExportedDeclarations()
  const allComponentExamples = await getComponentExamples()
  const allComponents = await Promise.all(
    Array.from(exportedDeclarations).map(async ([name, [declaration]]) => {
      if (Node.isFunctionDeclaration(declaration)) {
        const componentSourceFile = declaration.getSourceFile()
        const componentReadme = await getComponentReadme(
          componentSourceFile.getDirectoryPath()
        )
        const componentSlug = kebabCase(name)
        const componentData = {
          path: null,
          name: name,
          slug: componentSlug,
          readme: componentReadme,
          props: getComponentTypes(declaration),
          examples: allComponentExamples.filter(
            (example) => example.componentSlug === componentSlug
          ),
        }

        if (process.env.NODE_ENV === 'development') {
          componentData.path = declaration.getSourceFile().getFilePath()
        }

        return componentData
      }
    })
  )
  return allComponents.filter(Boolean)
}

export async function getHooks() {
  let docs = {}

  hooksSourceFile.getExportedDeclarations().forEach(([declaration]) => {
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

      if (process.env.NODE_ENV === 'development') {
        hookData.path = hookPath
      }

      return hookData
    })
  )
}

const DEBUG = process.argv.includes('--debug')
const cacheDirectory = '.cache'

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory)
}

async function writeComponentsData() {
  const components = await getComponents()

  if (DEBUG) {
    console.log('writing data to cache: ', components)
  }

  fs.writeFile(`${cacheDirectory}/components.json`, JSON.stringify(components))
}

async function writeHooksData() {
  const hooks = await getHooks()

  if (DEBUG) {
    console.log('writing hooks to cache: ', hooks)
  }

  fs.writeFile(`${cacheDirectory}/hooks.json`, JSON.stringify(hooks))
}

async function writeData() {
  await writeComponentsData()
  await writeHooksData()
}

const watcher = chokidar.watch([
  componentsSourceFile.getDirectoryPath() + '/**/*.(ts|tsx)',
  hooksSourceFile.getDirectoryPath() + '/**/*.(ts|tsx)',
])

watcher.on('change', async function (changedPath) {
  if (DEBUG) {
    console.log('refreshing: ', changedPath)
  }
  await project.getSourceFile(changedPath).refreshFromFileSystem()

  const start = performance.now()
  if (DEBUG) {
    console.log('start gathering updated hooks: ', start)
  }

  await writeData()

  if (DEBUG) {
    console.log('end gathering updated hooks: ', performance.now() - start)
  }
})

const start = performance.now()
if (DEBUG) {
  console.log('start gathering initial hooks: ', start)
}

writeData().then(() => {
  if (DEBUG) {
    console.log('finished gathering initial hooks: ', performance.now() - start)
  }
})
