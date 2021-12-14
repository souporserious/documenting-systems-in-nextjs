import { getEditorLink } from 'utils/get-editor-link'
import { useComponent } from 'hooks/use-component'
import allHooks from '../../.cache/hooks.json'

function Example({
  example,
}: {
  example: { code: string; compiledCode: string }
}) {
  const Component = useComponent(example.compiledCode)
  return (
    <div>
      <Component />
      <pre>{example.code}</pre>
    </div>
  )
}

export default function Hook({ hook }) {
  return (
    <>
      <h1>{hook.name}</h1>
      <p>{hook.description}</p>
      {hook.path && (
        <a href={getEditorLink({ path: hook.path })}>View Source</a>
      )}
      <h2>Examples</h2>
      {hook.examples.map((example, index) => (
        <Example key={index} example={example} />
      ))}
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
