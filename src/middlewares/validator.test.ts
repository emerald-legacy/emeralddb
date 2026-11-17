import test from 'ava'
import express from 'express'
import Joi from 'joi'
import { asyncHandler } from '../utils/asyncHandler'
import { validate, ValidatedRequest } from './validator'

const querySchema = {
  query: Joi.object<{ page: number }>({ page: Joi.number().integer().required() }),
}

async function getPage(query: string): Promise<{ status: number; body: string }> {
  const app = express()
  app.set('env', 'test') // keeps Express's default error handler from logging
  app.get(
    '/items',
    validate(querySchema),
    asyncHandler(async (req: ValidatedRequest<typeof querySchema>) => ({
      page: req.query.page,
      type: typeof req.query.page,
    }))
  )

  const server = app.listen(0)
  try {
    const address = server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('Expected a TCP server address')
    }
    const response = await fetch(`http://localhost:${address.port}/items${query}`)
    return { status: response.status, body: await response.text() }
  } finally {
    server.close()
  }
}

// Express 5 makes req.query a getter; assigning it used to throw a TypeError (500)
test('validate replaces req.query with the validated, converted values', async (t) => {
  const result = await getPage('?page=2')
  t.is(result.status, 200)
  t.deepEqual(JSON.parse(result.body), { page: 2, type: 'number' })
})

test('validate rejects an invalid query with 400', async (t) => {
  const result = await getPage('?page=abc')
  t.is(result.status, 400)
})
