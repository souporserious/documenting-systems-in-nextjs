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

project.addSourceFilesAtPaths(['components/**/*.{ts,tsx}', 'hooks/**/*.ts'])

export const typeChecker = project.getTypeChecker()
export const componentsSourceFile = project.getSourceFile('components/index.ts')
export const hooksSourceFile = project.getSourceFile('hooks/index.ts')
