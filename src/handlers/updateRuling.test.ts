import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Ruling } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import { handler, schema } from './updateRuling'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import rulingStore = require('../gateways/storage/private/ruling')

const existing: Ruling = { id: 7, card_id: 'card-a', text: 'Old text', source: '', link: '' }

function update(rulingId: string, body: Ruling) {
  const app = express()
  app.use(express.json())
  app.post('/rulings/:rulingId', validate(schema), asyncHandler(handler))
  return sendRequest(app, 'POST', `/rulings/${rulingId}`, body)
}

function stubStore() {
  const written: Ruling[] = []
  rulingStore.getRuling = async (id) => (id === existing.id ? { ...existing } : undefined)
  rulingStore.insertOrUpdateRulingWithExistingId = async (ruling) => {
    written.push(ruling)
    return ruling
  }
  return written
}

test.serial('updates an existing ruling', async (t) => {
  const written = stubStore()

  const response = await update('7', { ...existing, text: 'New text' })

  t.is(response.status, 200)
  t.like(response.body, { id: 7, text: 'New text' })
  t.is(written.length, 1)
})

test.serial('an unknown ruling id is a 404 and writes nothing (regression)', async (t) => {
  const written = stubStore()

  const response = await update('8', { ...existing, id: 8 })

  t.is(response.status, 404)
  t.deepEqual(written, [])
})

test.serial('different ids in the URL and the body are a 400 and write nothing', async (t) => {
  const written = stubStore()

  const response = await update('7', { ...existing, id: 8 })

  t.is(response.status, 400)
  t.deepEqual(written, [])
})
