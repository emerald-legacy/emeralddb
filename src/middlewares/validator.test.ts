import test from 'ava'
import express from 'express'
import Joi from 'joi'
import { sendRequest } from '../testUtils'
import { asyncHandler } from '../utils/asyncHandler'
import { validate, ValidatedRequest } from './validator'

const querySchema = {
  query: Joi.object<{ page: number }>({ page: Joi.number().integer().required() }),
}

function getPage(query: string) {
  const app = express()
  app.get(
    '/items',
    validate(querySchema),
    asyncHandler(async (req: ValidatedRequest<typeof querySchema>) => ({
      page: req.query.page,
      type: typeof req.query.page,
    }))
  )
  return sendRequest(app, 'GET', `/items${query}`)
}

// Express 5 makes req.query a getter; assigning it used to throw a TypeError (500)
test('validate replaces req.query with the validated, converted values', async (t) => {
  const result = await getPage('?page=2')
  t.is(result.status, 200)
  t.deepEqual(result.body, { page: 2, type: 'number' })
})

test('validate rejects an invalid query with 400', async (t) => {
  const result = await getPage('?page=abc')
  t.is(result.status, 400)
})
