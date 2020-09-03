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
