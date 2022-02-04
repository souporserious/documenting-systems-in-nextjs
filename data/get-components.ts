import { kebabCase } from 'case-anything'
import type { CallExpression, Directory } from 'ts-morph'
import { Node } from 'ts-morph'
import urlSlug from 'url-slug'
import { getComponentTypes } from './get-component-types'
import { getExamples } from './get-examples'
import { getReadme } from './get-readme'
import { componentsSourceFile } from './project'

export async function getComponents() {
  const sourceDirectories = componentsSourceFile.getDirectory().getDirectories()
  const sourceDocs = await Promise.all(sourceDirectories.map(getDirectoryDocs))
  return sourceDocs
}

async function getDirectoryDocs(directory: Directory) {
  const path = directory.getPath()
  const name = directory.getBaseName()
  const readme = await getReadme(path)
  const examples = await getExamples(directory)
  const types = getDocs(directory)

  /** Append component prop type links to headings data. */
  if (readme?.data && types.length > 0) {
    readme.data.headings = [
      ...readme.data.headings,
      {
        slug: `#props`,
        level: 2,
        title: 'Props',
      },
      ...types.map((type) => ({
        slug: `#${urlSlug(type.name)}`,
        level: 3,
        title: type.name,
      })),
    ]
  }

  return {
    name,
    readme,
    types,
    examples,
    slug: kebabCase(name),
    path:
      process.env.NODE_ENV === 'development'
        ? `${path}/index.ts`
        : path.replace(process.cwd(), ''),
  }
}

function getDocs(directory: Directory) {
  const exportedDeclarations = directory
    .getSourceFile('index.ts')
    .getExportedDeclarations()
  const docs = Array.from(exportedDeclarations)
    .map(([name, [declaration]]) => getReactDocs(name, declaration))
    .filter(Boolean)
  return docs
}

function getReactDocs(name, declaration) {
  const reactFunctionDeclaration = getReactFunctionDeclaration(declaration)
  if (reactFunctionDeclaration) {
    const path = declaration.getSourceFile().getFilePath()
    return {
      name,
      slug: kebabCase(name),
      props: getComponentTypes(reactFunctionDeclaration),
      path:
        process.env.NODE_ENV === 'development'
          ? path
          : path.replace(process.cwd(), ''),
    }
  }
  return null
}

export function isComponent(name) {
  return /[A-Z]/.test(name.charAt(0))
}

export function isForwardRefExpression(initializer) {
  if (Node.isCallExpression(initializer)) {
    const expression = initializer.getExpression()

    /**
     * forwardRef(() => <Component />)
     */
    if (
      Node.isIdentifier(expression) &&
      expression.getText() === 'forwardRef'
    ) {
      return true
    }

    /**
     * React.forwardRef(() => <Component />)
     */
    if (
      Node.isPropertyAccessExpression(expression) &&
      expression.getText() === 'React.forwardRef'
    ) {
      return true
    }
  }

  return false
}

function getReactFunctionDeclaration(declaration: Node): Node {
  if (Node.isVariableDeclaration(declaration)) {
    const name = declaration.getName()
    const initializer = declaration.getInitializer()

    if (isComponent(name)) {
      /**
       * If we're dealing with a 'forwardRef' call we take the first argument of
       * the function since that is the component declaration.
       */
      if (isForwardRefExpression(initializer)) {
        const callExpression = initializer as CallExpression
        const [declaration] = callExpression.getArguments()
        return declaration
      }
      return declaration
    }
  }

  if (Node.isFunctionDeclaration(declaration)) {
    const name = declaration.getName()
    if (isComponent(name)) {
      return declaration
    }
  }

  return null
}
