import * as React from 'react'
import { Playground } from 'components'

export default function BasicUsage() {
  return (
    <Playground
      code={`exports.default = () => require('react').createElement('div', null, 'Hello World')`}
    />
  )
}
