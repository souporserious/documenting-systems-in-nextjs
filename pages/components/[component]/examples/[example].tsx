import * as React from 'react'
import { useComponent } from 'hooks'
import { getExamples } from 'utils/get-pages'
import { getEditorLink } from 'utils/get-editor-link'
import { pascalCase } from 'case-anything'

export default function Example({ component, example }) {
  const Component = useComponent(example.code)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2>
          {pascalCase(component)} / {example.name}
        </h2>
        {example.path && (
          <a href={getEditorLink({ path: example.path })}>Open Source</a>
        )}
      </div>
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
      component: query.params.component,
      example: examples.find(
        (example) =>
          example.componentSlug === query.params.component &&
          example.slug === query.params.example
      ),
    },
  }
}
