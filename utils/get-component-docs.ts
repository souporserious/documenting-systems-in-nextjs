import * as path from 'path'
import { Project, Node } from 'ts-morph'

const componentsDirectory = path.resolve(process.cwd(), 'components')
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
})

// TODO:
// add support for multiple components
// generate import statements for components using tsconfig paths
export function getComponentDocs(component) {
  const sourceFile = project.getSourceFile(
    path.resolve(process.cwd(), componentsDirectory, component, 'index.ts')
  )
  const exportedDeclarations = sourceFile.getExportedDeclarations()
  let docs = {}

  exportedDeclarations.forEach(([declaration]) => {
    if (Node.isFunctionDeclaration(declaration)) {
      const [props] = declaration.getParameters()
      const type = props.getType()
      const typeProps = type.getProperties().map((prop) => {
        const [propDeclaration] = prop.getDeclarations()
        const [commentRange] = propDeclaration.getLeadingCommentRanges()
        return {
          name: prop.getName(),
          type: prop.getTypeAtLocation(declaration).getText(),
          comment: commentRange?.getText() || null,
        }
      })
      docs[declaration.getName()] = typeProps
    }
  })

  return docs
}
