import { getEditorLink } from './get-editor-link'

/**
 * Returns a constructed source link for the local IDE in development or a GitHub
 * link in production.
 */
export function getSourceLink({ path }) {
  if (process.env.NODE_ENV === 'development') {
    return getEditorLink({ path })
  }
  return `https://github.com/souporserious/documenting-systems-in-nextjs/blob/main${path}`
}
