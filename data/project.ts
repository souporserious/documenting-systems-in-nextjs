import { Project } from 'ts-morph'

export const project = new Project({
  compilerOptions: {
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
  },
  tsConfigFilePath: 'tsconfig.json',
  skipAddingFilesFromTsConfig: true,
})

export const typeChecker = project.getTypeChecker()
export const componentsSourceFile = project.addSourceFileAtPath(
  'components/index.ts'
)
export const hooksSourceFile = project.addSourceFileAtPath('hooks/index.ts')
export const utilsSourceFile = project.addSourceFileAtPath('utils/index.ts')
