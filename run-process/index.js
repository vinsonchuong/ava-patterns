import {spawn} from 'child_process'
import {PassThrough} from 'stream'
import {wait} from '../index.js'

export default function (
  t,
  {command: [command, ...args], env = {}, cwd = process.cwd()}
) {
  const child = spawn(command, args, {
    env: {...process.env, ...env},
    cwd,
    detached: true
  })
  t.teardown(() => {
    process.kill(-child.pid)
  })

  let output = ''
  const outputStream = new PassThrough()
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  Promise.all([
    (async () => {
      for await (const data of child.stdout) {
        output += data
        outputStream.write(data)
      }
    })(),
    (async () => {
      for await (const data of child.stderr) {
        output += data
        outputStream.write(data)
      }
    })()
  ]).then(
    () => {
      outputStream.end()
    },
    (error) => {
      outputStream.emit('error', error)
    }
  )

  return {
    childProcess: child,
    get output() {
      return output
    },
    outputStream,
    async waitForOutput(pattern, timeout = 1000) {
      const match =
        typeof pattern === 'string'
          ? (string) => string.includes(pattern)
          : (string) => Boolean(string.match(pattern))

      await Promise.race([
        (async () => {
          await wait(timeout)
          throw new Error('Timeout exceeded without seeing expected output.')
        })(),
        (async () => {
          for await (const data of outputStream) {
            if (match(data)) {
              return
            }
          }

          throw new Error('Process ended without emitting expected output.')
        })()
      ])
    }
  }
}
