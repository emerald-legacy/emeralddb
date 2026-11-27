import test from 'ava'
import express from 'express'
import { UnauthorizedError } from 'express-jwt'
import { sendRequest } from '../testUtils'
import { asyncHandler } from '../utils/asyncHandler'
import { HttpError } from '../utils/HttpError'
import { errorHandler } from './errorHandler'

function appThrowing(error: unknown) {
  const server = express()
  server.use(express.json())
  server.post('/fail', () => {
    throw error
  })
  server.post(
    '/async',
    asyncHandler(async () => {
      throw error
    })
  )
  server.post('/echo', (req, res) => {
    res.json(req.body)
  })
  server.use(errorHandler)
  return server
}

test('an HttpError is sent as JSON with its status and message', async (t) => {
  const response = await sendRequest(appThrowing(new HttpError(403, 'No')), 'POST', '/async')
  t.is(response.status, 403)
  t.deepEqual(response.body, { message: 'No' })
})

test('an HttpError without a message gets the status text', async (t) => {
  const response = await sendRequest(appThrowing(new HttpError(401)), 'POST', '/fail')
  t.is(response.status, 401)
  t.deepEqual(response.body, { message: 'Unauthorized' })
})

test("express-jwt's errors are JSON 401s", async (t) => {
  const error = new UnauthorizedError('credentials_required', {
    message: 'No authorization token was found',
  })
  const response = await sendRequest(appThrowing(error), 'POST', '/fail')
  t.is(response.status, 401)
  t.deepEqual(response.body, { message: 'No authorization token was found' })
})

test('other errors are a 500 without their message', async (t) => {
  const originalError = console.error
  console.error = () => undefined // the handler logs it
  try {
    const response = await sendRequest(
      appThrowing(new Error('connection to database at 10.0.0.1 failed')),
      'POST',
      '/async'
    )
    t.is(response.status, 500)
    t.deepEqual(response.body, { message: 'Internal Server Error' })
  } finally {
    console.error = originalError
  }
})

test('malformed JSON in the body is a JSON 400', async (t) => {
  const server = appThrowing(undefined)
  server.set('env', 'test')
  const listener = server.listen(0)
  try {
    const address = listener.address()
    if (address === null || typeof address === 'string') throw new Error('no TCP address')
    const response = await fetch(`http://localhost:${address.port}/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    })
    t.is(response.status, 400)
    const body: unknown = await response.json()
    t.true(typeof body === 'object' && body !== null && 'message' in body)
  } finally {
    listener.close()
  }
})
