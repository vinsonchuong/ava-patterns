import test from 'ava'
import {http} from '../index.js'

test('sending an HTTP request', async (t) => {
  const response = await http({
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: {},
    body: 'Hello World!',
  })

  if (typeof response.body !== 'string') {
    return t.fail('Response body was not a string')
  }

  t.like(JSON.parse(response.body), {data: 'Hello World!'})
})

test('omitting unused fields', async (t) => {
  const response = await http({
    method: 'GET',
    url: 'https://httpbin.org/status/200',
  })
  t.like(response, {status: 200})
})
