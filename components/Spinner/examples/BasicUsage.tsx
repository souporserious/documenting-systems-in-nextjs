import { Stack, Spinner, spinnerSizes } from 'components'

export default function BasicUsage() {
  return (
    <Stack flexDirection="row" padding="8px" gap="8px">
      {Object.keys(spinnerSizes).map((size: keyof typeof spinnerSizes) => (
        <Spinner
          key={size}
          size={size}
          trackColor="rgba(255,255,255,0.5)"
          color="rgba(255,255,255,0.75)"
        />
      ))}
    </Stack>
  )
}
