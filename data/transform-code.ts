import { transform } from '@swc/core'

export async function transformCode(codeString) {
  const result = await transform(codeString, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
    },
    module: {
      type: 'commonjs',
    },
  })
  return result.code
}
