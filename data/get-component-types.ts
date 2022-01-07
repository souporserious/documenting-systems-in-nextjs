import { Node } from 'ts-morph'
import { typeChecker } from './project'

export function getComponentTypes(declaration: Node) {
  const signatures = declaration.getType().getCallSignatures()

  if (signatures.length === 0) {
    return []
  }

  const [propsSignature] = signatures
  const [props] = propsSignature.getParameters()

  if (props) {
    const valueDeclaration = props.getValueDeclaration()
    const propsType = typeChecker.getTypeOfSymbolAtLocation(
      props,
      valueDeclaration
    )
    return propsType
      .getApparentProperties()
      .map((prop) => {
        const [propDeclaration] = prop.getDeclarations()
        if (
          propDeclaration === undefined ||
          propDeclaration.getSourceFile().getFilePath().includes('node_modules')
        ) {
          return null
        }
        if (propDeclaration) {
          const [comment] = prop
            .getDeclarations()
            .filter(Node.isJSDocable)
            .map((declaration) =>
              declaration
                .getJsDocs()
                .map((doc) => doc.getComment())
                .flat()
            )
          return {
            name: prop.getName(),
            type: prop.getTypeAtLocation(declaration).getText(),
            comment: comment ?? null,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  return []
}
