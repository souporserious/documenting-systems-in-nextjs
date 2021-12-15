import { promises as fs, existsSync, mkdirSync, readdirSync } from 'fs'
import * as path from 'path'
import {
  Project,
  Node,
  FunctionDeclaration,
  CallExpression,
  ArrowFunction,
} from 'ts-morph'
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
  compilerOptions: {
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
  },
  tsConfigFilePath: 'tsconfig.json',
  skipAddingFilesFromTsConfig: true,
})

project.addSourceFilesAtPaths(['components/**/*.{ts,tsx}', 'hooks/**/*.ts'])

const componentsSourceFile = project.getSourceFile('components/index.ts')
const hooksSourceFile = project.getSourceFile('hooks/index.ts')

export function isForwardRefExpression(initializer) {
  if (Node.isCallExpression(initializer)) {
    const expression = initializer.getExpression()

    /** Test for: 'forwardRef' */
    if (
      Node.isIdentifier(expression) &&
      expression.getText() === 'forwardRef'
    ) {
      return true
    }

    /** Test for: 'React.forwardRef' */
    if (
      Node.isPropertyAccessExpression(expression) &&
      expression.getName() === 'forwardRef'
    ) {
      return true
    }
  }

  return false
}

export function getReactFunctionDeclaration(
  declaration
): FunctionDeclaration | ArrowFunction | null {
  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer()

    /**
     * If we're dealing with a 'forwardRef' call we take the first argument of
     * the function since that is the component declaration.
     */
    if (isForwardRefExpression(initializer)) {
      const callExpression = initializer as CallExpression
      const [declaration] = callExpression.getArguments()
      return declaration as FunctionDeclaration | ArrowFunction
    }
  }

  if (Node.isFunctionDeclaration(declaration)) {
    const name = declaration.getName()
    if (name[0] === name[0].toUpperCase()) {
      return declaration
    }
  }

  return null
}

export function getReactComponentTypes(
  declaration: FunctionDeclaration | ArrowFunction
) {
  const [props] = declaration.getParameters()
  const type = props.getType()
  return (
    type
      .getProperties()
      /** Filter out props from packages in node_modules */
      .filter((prop) => {
        const propDeclarations = prop.getDeclarations()
        if (propDeclarations !== undefined && propDeclarations.length > 0) {
          const hasPropAdditionalDescription = propDeclarations.some(
            (declaration) => {
              return !declaration
                .getSourceFile()
                .getFilePath()
                .includes('node_modules')
            }
          )
          return hasPropAdditionalDescription
        }
        return true
      })
      .map((prop) => {
        const [propDeclaration] = prop.getDeclarations()
        const [commentRange] = propDeclaration.getLeadingCommentRanges()
        return {
          name: prop.getName(),
          type: prop.getTypeAtLocation(declaration).getText(),
          comment: commentRange?.getText() || null,
        }
      })
  )
}

export async function getComponents() {
  const exportedDeclarations = componentsSourceFile.getExportedDeclarations()
  const allComponentExamples = await getComponentExamples()
  const allComponents = await Promise.all(
    Array.from(exportedDeclarations).map(async ([name, [declaration]]) => {
      const reactFunctionDeclaration = getReactFunctionDeclaration(declaration)

      if (reactFunctionDeclaration) {
        const componentSourceFile = reactFunctionDeclaration.getSourceFile()
        const componentReadme = await getComponentReadme(
          componentSourceFile.getDirectoryPath()
        )
        const componentSlug = kebabCase(name)
        const componentData = {
          path: null,
          name: name,
          slug: componentSlug,
          readme: componentReadme,
          props: getReactComponentTypes(reactFunctionDeclaration),
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
