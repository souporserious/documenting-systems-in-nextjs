import { Box } from 'components'
import { useCounter } from 'hooks'
import styled from 'styled-components'

const StyledText = styled.span({ color: 'tomato' })

export default function BasicUsage() {
  const { count, increment, decrement } = useCounter()
  return (
    <Box>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <StyledText>{count}</StyledText>
    </Box>
  )
}
