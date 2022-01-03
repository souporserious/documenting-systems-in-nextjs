import React, { useState } from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import dprint from 'dprint-node'
import { project } from './project'
import { Option, Select } from './components/Select'
import { getTopLevelDirectories } from './utils/get-top-level-directories'

const directories = getTopLevelDirectories()

function NewFile() {
  const [directory, setDirectory] = useState(null)
  const [value, setValue] = useState('')
  const [message, setMessage] = useState(null)

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
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => {
            try {
              /** Create index file that exports modules and types. */
              project.createSourceFile(
                `${directory}/${value}/index.ts`,
                `export * from './${value}'`
              )

              /** Create initial file for exports based on the value. */
              project
                .createSourceFile(`${directory}/${value}/${value}.tsx`)
                .addFunction({
                  name: value,
                  isExported: true,
                })
                .setBodyText(`return <div>Hello ${value}</div>`)

              /** Create a README with some initial content. */
              project.createSourceFile(
                `${directory}/${value}/README.mdx`,
                `Hello ${value}`
              )

              /** Update the local index.ts file to a barrel export and sort */
              const indexSourceFile = project.getSourceFile(
                `${directory}/index.ts`
              )

              indexSourceFile
                .addExportDeclaration({
                  moduleSpecifier: `./${value}`,
                  namedExports: [value],
                })
                .toNamespaceExport()

              /** Lastly, sort export declarations alphabetically. */
              const exportDeclarations = indexSourceFile.getExportDeclarations()
              const sortedDeclarations = exportDeclarations
                .map((declaration) =>
                  declaration.getModuleSpecifier().getLiteralValue()
                )
                .sort()

              exportDeclarations.forEach((declaration) => {
                const sortedIndex = sortedDeclarations.findIndex(
                  (moduleFilePath) => {
                    return (
                      moduleFilePath ===
                      declaration.getModuleSpecifier().getLiteralValue()
                    )
                  }
                )
                declaration.setOrder(sortedIndex)
              })

              project.save()

              /** Format the file now that we've saved our transformations. */
              const formattedSourceFile = dprint.format(
                indexSourceFile.getFilePath(),
                indexSourceFile.getFullText(),
                {
                  quoteStyle: 'alwaysSingle',
                  semiColons: 'asi',
                }
              )

              indexSourceFile.replaceWithText(formattedSourceFile)

              setMessage(`Created ${value} in ${directory} successfully!`)
            } catch {
              setMessage('Name already in use, try another name.')
            } finally {
              setValue('')
              setTimeout(() => {
                setMessage(null)
              }, 3000)
            }
          }}
        />
      </Box>
      {message && <Text>{message}</Text>}
    </Box>
  )
}

export default function App() {
  const [selectedToken, setSelectedToken] = useState(null)

  if (selectedToken === 'new') {
    return <NewFile />
  }

  return (
    <Select onChange={setSelectedToken}>
      <Option value="new">New</Option>
    </Select>
  )
}
