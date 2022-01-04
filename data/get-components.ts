import { kebabCase } from 'case-anything'
import type { CallExpression } from 'ts-morph'
import { Node } from 'ts-morph'
import { getComponentExamples } from './get-component-examples'
import { getComponentReadme } from './get-component-readme'
import { getComponentTypes } from './get-component-types'
import { componentsSourceFile } from './project'

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
          name,
          slug: componentSlug,
          readme: componentReadme?.code,
          props: getComponentTypes(reactFunctionDeclaration),
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
