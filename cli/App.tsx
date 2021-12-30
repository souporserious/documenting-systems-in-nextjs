import React, { useState } from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
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

              /** Create the initial file for export based on the type. */
              project
                .createSourceFile(`${directory}/${value}/${value}.tsx`)
                .addFunction({
                  name: value,
                  isExported: true,
                })

              /** Lastly, create a README with some initial content. */
              project.createSourceFile(
                `${directory}/${value}/README.mdx`,
                `# ${value}`
              )

              project.save()

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
