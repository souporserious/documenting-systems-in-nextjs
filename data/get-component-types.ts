import type {
  BindingElement,
  PropertyAssignment,
  PropertySignature,
} from 'ts-morph'
import { Node, TypeFormatFlags } from 'ts-morph'
import { typeChecker } from './index'

export function getComponentTypes(declaration: Node) {
  const signatures = declaration.getType().getCallSignatures()

  if (signatures.length === 0) {
    return null
  }

  const [propsSignature] = signatures
  const [props] = propsSignature.getParameters()

  if (props) {
    const valueDeclaration = props.getValueDeclaration()
    const propsType = typeChecker.getTypeOfSymbolAtLocation(
      props,
      valueDeclaration
    )
    const firstChild = valueDeclaration.getFirstChild()
    let defaultValues = {}

    if (Node.isObjectBindingPattern(firstChild)) {
      defaultValues = getDefaultValuesFromProperties(firstChild.getElements())
    }

    return propsType
      .getApparentProperties()
      .map((prop) => {
        const declarations = prop.getDeclarations()
        const propDeclaration = declarations[0] as PropertySignature

        if (
          (propDeclaration || declaration)
            .getSourceFile()
            .getFilePath()
            .includes('node_modules')
        ) {
          return null
        }

        const propName = prop.getName()
        const propType = prop.getTypeAtLocation(declaration)
        const description = prop
          .getDeclarations()
          .filter(Node.isJSDocable)
          .map((declaration) =>
            declaration
              .getJsDocs()
              .map((doc) => doc.getComment())
              .flat()
          )
          .join('\n')
        const defaultValue = defaultValues[propName] || null

        return {
          name: propName,
          required: !propDeclaration?.hasQuestionToken() && !defaultValue,
          description: description || null,
          type: propType.getText(
            declaration,
            TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
          ),
          defaultValue,
        }
      })
      .filter(Boolean)
  }
  return null
}

function getDefaultValuesFromProperties(
  properties: Array<PropertyAssignment | BindingElement>
) {
  const defaultValues: Record<string, string | boolean | number | null> = {}

  properties.forEach((property) => {
    if (Node.isSpreadAssignment(property) || !property.getName()) {
      return
    }

    const name = property.getName()
    const initializer = property.getInitializer()

    if (initializer) {
      defaultValues[name] = initializer.getText()
    }
  })

  return defaultValues
}
