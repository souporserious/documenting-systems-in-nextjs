import { promises as fs } from 'fs'
import * as path from 'path'

export async function getData(key) {
  const data = await fs.readFile(
    path.resolve(process.cwd(), `.cache/${key}.json`),
    'utf-8'
  )
  return JSON.parse(data)
}
