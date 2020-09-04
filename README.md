# ava-patterns
[![npm](https://img.shields.io/npm/v/ava-patterns.svg)](https://www.npmjs.com/package/ava-patterns)
[![CI Status](https://github.com/vinsonchuong/ava-patterns/workflows/CI/badge.svg)](https://github.com/vinsonchuong/ava-patterns/actions?query=workflow%3ACI)
[![dependencies Status](https://david-dm.org/vinsonchuong/ava-patterns/status.svg)](https://david-dm.org/vinsonchuong/ava-patterns)
[![devDependencies Status](https://david-dm.org/vinsonchuong/ava-patterns/dev-status.svg)](https://david-dm.org/vinsonchuong/ava-patterns?type=dev)

Some useful helpers for tests in AVA.

## Usage
Install [ava-patterns](https://www.npmjs.com/package/ava-patterns)
by running:

```sh
yarn add ava-patterns
```

### `useTemporaryDirectory()`
Create a temporary directory and delete it (and its contents) at the end of the
test.

```js
import test from 'ava'
import * as path from 'path'
import {promises as fs} from 'fs'
import {useTemporaryDirectory} from 'ava-patterns'

test('writing files', async (t) => {
  const directory = await useTemporaryDirectory(t)
  await fs.writeFile(path.join(directory, 'file.txt'), 'Hello World!')
  t.pass()
})
```

### `runProcess()`
Spawn a process and kill it at the end of the test.

The second argument supports the following options:

- `command`: The command line command as an array of strings.
- `env`: An object of environment variables.
- `cwd`: The working directory in which to run the command

Returns an object with the following members:

- `output`: A string containing all of the output from stdout and stderr.
- `outputStream`: A `Readable` stream for both stdout and stderr.
- `waitForOutput(pattern, timeout = 1000)`: Enables waiting for a given
  substring or regular expression to be output, for up to a given timeout.
- `childProcess`: The underlying instance of `ChildProcess`

```js
import test from 'ava'
import {runProcess} from 'ava-patterns'
import got from 'got'

test('running a Node server', async (t) => {
  const script = `
    import * as http from 'http'
    const server = http.createServer((request, response) => {
      response.end('Hello World!')
    })
    server.listen(10000, () => {
      console.log('Listening')
    })
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script]
  })

  await program.waitForOutput('Listening')

  t.is(program.output, 'Listening\n')

  const response = await got('http://localhost:10000')
  t.is(response.body, 'Hello World!')
})
```

### `wait()`
Wait for a given number of milliseconds.

```js
import test from 'ava'
import {wait} from 'ava-patterns'

test('writing files', async (t) => {
  // perform action and wait for results
  await wait(500)
  // check results
})
```
