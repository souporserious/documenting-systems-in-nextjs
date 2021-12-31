import * as React from 'react'
import { Playground } from 'components'

export default function Compiled() {
  return (
    <Playground compiledCodeString="exports.default = () => require('react').createElement('div', null, 'Hello World')" />
  )
}
