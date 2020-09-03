import fs from 'fs-extra'
import tempy from 'tempy'

export default async function (t) {
  const directory = tempy.directory()
  await fs.ensureDir(directory)
  t.teardown(async () => {
    await fs.remove(directory)
  })
  return directory
}
