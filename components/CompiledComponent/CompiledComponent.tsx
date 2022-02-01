import * as React from 'react'
import { getComponent } from 'utils/get-component'

export class CompiledComponent extends React.Component<{ codeString: string }> {
  state = {
    component: this.props.codeString
      ? getComponent(this.props.codeString)
      : null,
  }

  componentDidUpdate(prevProps) {
    const { codeString } = this.props
    if (prevProps.codeString !== codeString) {
      this.setState({
        component: codeString ? getComponent(codeString) : null,
      })
    }
  }

  render() {
    return this.state.component
      ? React.createElement(this.state.component)
      : null
  }
}
