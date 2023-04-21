import process from 'node:process'
import {spawn} from 'node:child_process'
import {EventEmitter} from 'node:events'
import {pEventIterator} from 'p-event'
import {wait} from '../index.js'

/**
 * Create a temporary directory and delete it at the end of the test.
 *
 * @param {import('ava').ExecutionContext<any>} t - the AVA test context
 * @param {Object} options
 * @param {Array<string>} options.command - a shell command to spawn a process
 * @param {{ [name: string]: string }} [options.env] - Environment variables to
 *   pass into the process
 * @param {string} [options.cwd] - Working directory in which to run the process
 *
 * @return {{
 *   childProcess: import('node:child_process').ChildProcess
 *   output: string,
 *   events: import('node:events').EventEmitter,
 *   waitForOutput(output: string | RegExp, timeout?: number): Promise<void>,
 *   waitUntilExit(): Promise<number>
 * }}
 */
export default function (
  t,
  {command: [command, ...args], env = {}, cwd = process.cwd()},
) {
  const child = spawn(command, args, {
    env: {...process.env, ...env},
    cwd,
    detached: true,
  })
  t.teardown(() => {
    try {
      process.kill(-child.pid)
    } catch (error) {
      if (error.code !== 'ESRCH') {
        throw error
      }
    }
  })

  const events = new EventEmitter()

  const exitCode = new Promise((resolve) => {
    child.on('close', (code) => {
      events.emit('exit', code)
      resolve(code)
    })
  })

  let output = ''

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  Promise.all([
    (async () => {
      for await (const data of child.stdout) {
        output += data
        events.emit('stdout', data)
        events.emit('output', data)
      }
    })(),
    (async () => {
      for await (const data of child.stderr) {
        output += data
        events.emit('stderr', data)
        events.emit('output', data)
      }
    })(),
  ]).catch((error) => {
    events.emit('error', error)
  })

  return {
    childProcess: child,
    get output() {
      return output
    },
    events,
    async waitForOutput(pattern, timeout = 1000) {
      await Promise.race([
        (async () => {
          await wait(timeout)
          throw new Error(
            `Timeout exceeded without seeing expected output:\n${output}`,
          )
        })(),
        (async () => {
          for await (const output of pEventIterator(events, 'output', {
            resolutionEvents: ['exit'],
            rejectionEvents: ['error'],
          })) {
            if (
              typeof pattern === 'string'
                ? output.includes(pattern)
                : pattern.test(output)
            ) {
              return
            }
          }

          throw new Error(
            `Process ended without emitting expected output:\n${output}`,
          )
        })(),
      ])
    },
    waitUntilExit() {
      return exitCode
    },
  }
}
