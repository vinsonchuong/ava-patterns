import path from 'node:path'
import process from 'node:process'
import {promises as fs} from 'node:fs'
import {promisify} from 'node:util'
import childProcess from 'node:child_process'
import test from 'ava'
import {useTemporaryDirectory} from '../index.js'

const exec = promisify(childProcess.exec)

test.serial('creating a directory', async (t) => {
  const directory = await useTemporaryDirectory(t)

  const stats = await fs.stat(directory.path)
  t.true(stats.isDirectory())

  await directory.writeFile(
    'file.txt',
    `
    Hello World!
  `,
  )

  t.is(
    await fs.readFile(path.join(directory.path, 'file.txt'), 'utf8'),
    'Hello World!\n',
  )

  global.directory = directory
})

test.serial('cleaning up the directory', async (t) => {
  await t.throwsAsync(fs.stat(global.directory))
})

test('automatically setting permissions for executable files', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await directory.writeFile(
    'bin.js',
    `
      #!/usr/bin/env node
      console.log('Hello World!')
    `,
  )

  const {stdout: output} = await exec('./bin.js', {cwd: directory.path})
  t.is(output, 'Hello World!\n')
})

test('automatically creating subdirectories', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await directory.writeFile(
    'folder/file.txt',
    `
    Hello World!
  `,
  )

  t.is(
    await fs.readFile(path.join(directory.path, 'folder', 'file.txt'), 'utf8'),
    'Hello World!\n',
  )
})

test('configuring where to create a directory', async (t) => {
  const directory = await useTemporaryDirectory(t, {prefix: process.cwd()})
  t.is(path.dirname(directory.path), process.cwd())

  await directory.writeFile('file.txt', 'Hello World!')
  t.is(
    await fs.readFile(
      path.join(process.cwd(), path.basename(directory.path), 'file.txt'),
      'utf8',
    ),
    'Hello World!\n',
  )
})
