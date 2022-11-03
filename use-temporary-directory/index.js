import path from 'node:path'
import fs from 'fs-extra'
import tempy from 'tempy'
import stripIndent from 'strip-indent'

/**
 * @typedef {{
 *   path: string,
 *   writeFile(filePath: string, fileContents: string): Promise<void>
 * }} Directory
 */

/**
 * @typedef {Object} Options
 * @property {string} [prefix] - A directory in which to create the temporary
 *   directory
 */

/**
 * Create a temporary directory and delete it at the end of the test.
 *
 * @param {import('ava').ExecutionContext<any>} t
 * @param {Options} [options]
 *
 * @return {Promise<{
 *   path: string,
 *   writeFile(filePath: string, fileContents: string): Promise<string>
 * }>} an object allowing manipulation of files within the directory.
 */
export default async function (t, options) {
  const directory = options?.prefix
    ? path.join(options.prefix, path.basename(tempy.directory()))
    : tempy.directory()

  await fs.ensureDir(directory)
  t.teardown(async () => {
    await fs.remove(directory)
  })

  return {
    path: directory,
    async writeFile(filePath, fileContents) {
      const absolutePath = path.join(directory, filePath)
      const contents = stripIndent(fileContents.trim()) + '\n'

      await fs.mkdir(path.dirname(absolutePath), {recursive: true})
      await fs.writeFile(absolutePath, contents)

      if (contents.startsWith('#!')) {
        await fs.chmod(absolutePath, 0o755)
      }

      return absolutePath
    },
  }
}
