import test from 'ava'
import {http} from '../index.js'

test('sending a simple HTTP GET request', async (t) => {
  t.regex(await http('http://example.com'), /Example Domain/)
})

test('sending an HTTP request', async (t) => {
  const response = await http({
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: {},
    body: 'Hello World!'
  })
  t.like(JSON.parse(response.body), {data: 'Hello World!'})
})
