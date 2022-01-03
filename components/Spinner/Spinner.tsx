import styled, { css, keyframes } from 'styled-components'

const rotate = keyframes({
  '100%': { transform: 'rotate(360deg)' },
})

const rotateCentered = keyframes({
  '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
})

export const spinnerSizes = {
  sm: '16px',
  md: '32px',
  lg: '64px',
} as const

export const spinnerSizeThickness = {
  sm: '3px',
  md: '4px',
  lg: '8px',
} as const

export type SpinnerProps = {
  /**
   * Primary color of spinner.
   */
  color?: string

  /**
   * Secondary color of spinner.
   */
  trackColor?: string

  /**
   * Size of spinner.
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Position absolutely in the center of a relative parent.
   */
  center?: boolean
}

export const Spinner = styled.div<SpinnerProps>(
  (props) => ({
    width: spinnerSizes[props.size || 'md'],
    height: spinnerSizes[props.size || 'md'],
    border: `${spinnerSizeThickness[props.size]} solid ${props.trackColor}`,
    borderTopColor: props.color,
    borderRadius: '100%',
  }),
  (props) =>
    props.center
      ? css`
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg);
          animation: ${rotateCentered} 500ms infinite linear;
        `
      : css`
          transform: rotate(0deg);
          animation: ${rotate} 500ms infinite linear;
        `
)
