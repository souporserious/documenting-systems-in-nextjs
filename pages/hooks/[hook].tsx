import Head from 'next/head'
import { CompiledComponent, Stack } from 'components'
import { getSourceLink } from 'utils'
import { allHooks } from '.data/hooks'

function Example({
  example,
}: {
  example: { code: string; compiledCode: string }
}) {
  return (
    <div>
      <CompiledComponent codeString={example.compiledCode} />
      <pre>{example.code}</pre>
    </div>
  )
}

export default function Hook({ hook }) {
  return (
    <>
      <Head>
        <title>Hooks / {hook.name}</title>
      </Head>
      <Stack gap={32}>
        {hook.path && (
          <a href={getSourceLink({ path: hook.path })}>View Source</a>
        )}
        <code>import {`{ ${hook.name} }`} from 'hooks'</code>
        <Stack gap={16}>
          <h1>{hook.name}</h1>
          <p>{hook.description}</p>
        </Stack>
        <Stack gap={16}>
          <h2>Examples</h2>
          <Stack gap={8}>
            {hook.examples.map((example, index) => (
              <Example key={index} example={example} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: allHooks.map((hook) => ({
      params: { hook: hook.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const hook = allHooks.find((hook) => hook.slug === params.hook)
  return { props: { hook } }
}
