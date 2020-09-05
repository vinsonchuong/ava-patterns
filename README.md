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

Returns an object with the following members:

- `path`: The absolute path to the temporary directory.
- `writeFile(filePath, fileContents)`: Write a file with path relative to the
  temporary directory. Any leading whitespace in the file contents is stripped.

```js
import test from 'ava'
import {useTemporaryDirectory} from 'ava-patterns'

test('writing files', async (t) => {
  const directory = await useTemporaryDirectory(t)
  await directory.write('file.txt', `
    Hello World!
  `)
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

### `http()`
Concisely send HTTP requests.

If given a URL string, sends a GET request and returns the response body.

Otherwise, takes in an object with properties `method`, `url`, `headers`, and an
optional `body` and returns an object with properties `status`, `headers`, and
`body`.

```js
import {http} from 'ava-patterns'

test('sending HTTP requests', async (t) => {
  t.regex(await http('http://example.com'), /Example Domain/)

  const response = await sendRequest({
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: {},
    body: 'Hello World!'
  })
  t.like(JSON.parse(response.body), {data: 'Hello World!'})
})
```
