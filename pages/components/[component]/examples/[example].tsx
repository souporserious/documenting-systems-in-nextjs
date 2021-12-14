import * as React from 'react'
import { useComponent } from 'hooks'
import { getComponents } from 'utils/get-components'
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
          <a href={getEditorLink({ path: example.path })}>View Source</a>
        )}
      </div>
      <Component />
    </div>
  )
}

export async function getStaticPaths() {
  const allComponents = await getComponents()
  const allExamples = allComponents.flatMap((component) => component.examples)
  return {
    paths: allExamples.map((example) => ({
      params: {
        component: example.componentSlug,
        example: example.slug,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps(query) {
  const allComponents = await getComponents()
  const allExamples = allComponents.flatMap((component) => component.examples)
  return {
    props: {
      component: query.params.component,
      example: allExamples.find(
        (example) =>
          example.componentSlug === query.params.component &&
          example.slug === query.params.example
      ),
    },
  }
}
