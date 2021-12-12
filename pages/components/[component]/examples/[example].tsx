import * as React from 'react'
import { useComponent } from 'hooks'
import { getExamples } from 'utils/get-pages'
import { getEditorLink } from 'utils/get-editor-link'

export default function Example({ example }) {
  const Component = useComponent(example.code)
  return (
    <div>
      <h2>{example.name}</h2>
      {example.path && (
        <a href={getEditorLink({ path: example.path })}>Open Source</a>
      )}
      <Component />
    </div>
  )
}

export async function getStaticPaths() {
  const examples = await getExamples()
  return {
    paths: examples.map((example) => ({
      params: {
        component: example.componentSlug,
        example: example.slug,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps(query) {
  const examples = await getExamples()
  return {
    props: {
      example: examples.find(
        (example) =>
          example.componentSlug === query.params.component &&
          example.slug === query.params.example
      ),
    },
  }
}
