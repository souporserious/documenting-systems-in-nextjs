import * as React from 'react'
import { Playground } from 'components'

export default function BasicUsage() {
  return (
    <Playground
      codeString={`exports.default = () => require('react').createElement('div', null, 'Hello World')`}
    />
  )
}
