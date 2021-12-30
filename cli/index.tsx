#!/usr/bin/env node
import React from 'react'
import { promises as fs } from 'fs'
import { Text, useInput, render, Box } from 'ink'

function App() {
  useInput((input) => {
    if (input === 'c') {
      fs.writeFile('test.js', 'Hello World!').then(() => {
        console.log('File created ✅')
      })
    }
  })
  return (
    <Box justifyContent="center">
      <Text>Welcome</Text>
    </Box>
  )
}

render(<App />)
