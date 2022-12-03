import urlSlug from 'url-slug'

/**
 * Parses headings from a plain Markdown or MDX file.
 */
export function getHeadingsFromMarkdown(content: string) {
  return content
    .split('\n')
    .filter((line) => line.match(/^#{1,3}\s/))
    .map((line) => {
      const [, level, title] = line.match(/(#{1,3})\s(.*)/)
      return {
        slug: `#${urlSlug(title)}`,
        level: level.length,
        title,
      }
    })
}
