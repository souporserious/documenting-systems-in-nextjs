import React, { useState } from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import dprint from 'dprint-node'
import { project } from './project'
import { Option, Select } from './components/Select'
import { getTopLevelDirectories } from './utils/get-top-level-directories'

const directories = getTopLevelDirectories()
const formatString = (filePath, text) =>
  dprint.format(filePath, text, {
    quoteStyle: 'alwaysSingle',
    semiColons: 'asi',
    newLineKind: 'system',
    lineWidth: 80,
    indentWidth: 2,
  })

function NewFile({ onAdd }: { onAdd: () => void }) {
  const [directory, setDirectory] = useState(null)
  const [value, setValue] = useState('')
  const [message, setMessage] = useState(null)

  function handleSubmit() {
    try {
      /** Create index file that exports modules and types. */
      const indexSourceFile = project.createSourceFile(
        `${directory}/${value}/index.ts`,
        `export * from './${value}'`
      )

      /** Create initial file for exports based on the value. */
      const mainSourceFile = project.createSourceFile(
        `${directory}/${value}/${value}.tsx`
      )

      mainSourceFile
        .addFunction({
          name: value,
          isExported: true,
        })
        .setBodyText(`return <div>Hello ${value}</div>`)

      /** Create a README with some initial content. */
      project.createSourceFile(
        `${directory}/${value}/README.mdx`,
        `Hello ${value}\n`
      )

      /** Update the local index.ts file to a barrel export and sort */
      const rootIndexSourceFile = project.getSourceFile(`${directory}/index.ts`)

      rootIndexSourceFile
        .addExportDeclaration({
          moduleSpecifier: `./${value}`,
          namedExports: [value],
        })
        .toNamespaceExport()

      /** Sort export declarations alphabetically. */
      const exportDeclarations = rootIndexSourceFile.getExportDeclarations()
      const sortedDeclarations = exportDeclarations
        .map((declaration) =>
          declaration.getModuleSpecifier().getLiteralValue()
        )
        .sort()

      exportDeclarations.forEach((declaration) => {
        const sortedIndex = sortedDeclarations.findIndex((moduleFilePath) => {
          return (
            moduleFilePath ===
            declaration.getModuleSpecifier().getLiteralValue()
          )
        })
        declaration.setOrder(sortedIndex)
      })

      /** Lastly, format all files. */
      ;[mainSourceFile, indexSourceFile, rootIndexSourceFile].forEach(
        (sourceFile) => {
          sourceFile.replaceWithText(
            formatString(sourceFile.getFilePath(), sourceFile.getFullText())
          )
        }
      )

      project.save()

      setMessage(`Created ${value} in ${directory} successfully!`)
      setTimeout(() => {
        onAdd()
      }, 3000)
    } catch {
      setMessage('Name already in use, try another name.')
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } finally {
      setValue('')
    }
  }

  if (directory === null) {
    return (
      <Select onChange={(value) => setDirectory(value)}>
        {Array.from(directories).map((directory) => (
          <Option key={directory} value={directory}>
            {directory}
          </Option>
        ))}
      </Select>
    )
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Box marginRight={1}>
          <Text>Enter name:</Text>
        </Box>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
      {message && <Text>{message}</Text>}
    </Box>
  )
}

export default function App() {
  const [selectedToken, setSelectedToken] = useState(null)

  if (selectedToken === 'new') {
    return <NewFile onAdd={() => setSelectedToken(null)} />
  }

  return (
    <Select onChange={setSelectedToken}>
      <Option value="new">New</Option>
    </Select>
  )
}
