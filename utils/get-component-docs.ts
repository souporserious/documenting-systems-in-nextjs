import * as path from 'path'
import { Project, Node } from 'ts-morph'
import { pascalCase } from 'case-anything'

const componentsDirectory = path.resolve(process.cwd(), 'components')
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
})

// TODO:
// add support for multiple components
// add support for forward ref
// generate import statements for components using tsconfig paths
export function getComponentDocs(component) {
  const componentName = pascalCase(component)
  const sourcePath = path.resolve(
    process.cwd(),
    componentsDirectory,
    componentName,
    'index.ts'
  )

  console.log(`Generating docs for "${componentName}" at: ${sourcePath}`)

  const sourceFile = project.getSourceFile(sourcePath)
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
