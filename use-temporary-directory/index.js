import path from 'node:path'
import fs from 'fs-extra'
import tempy from 'tempy'
import stripIndent from 'strip-indent'

export default async function (t) {
  const directory = tempy.directory()

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
    }
  }
}
