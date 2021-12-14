import * as React from 'react'
import { useComponent } from 'hooks'
import { getEditorLink } from 'utils/get-editor-link'
import { pascalCase } from 'case-anything'
import allComponents from '../../../../.cache/components.json'

export default function Example({ component, example }) {
  const Component = useComponent(example.code)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2>
          {pascalCase(component)} / {example.name}
        </h2>
        {example.path && (
          <a href={getEditorLink({ path: example.path })}>View Source</a>
        )}
      </div>
      <Component />
    </>
  )
}

export async function getStaticPaths() {
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
