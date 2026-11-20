import '../testEnv'
import test from 'ava'
import express from 'express'
import { sendRequest } from '../testUtils'
import { clearValidationDataAfterWrites } from './clearValidationData'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import validationData = require('../handlers/validators/validationData')

async function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, status = 200) {
  let clears = 0
  validationData.clearValidationData = () => {
    clears += 1
  }
  const app = express()
  app.use('/api', clearValidationDataAfterWrites)
  app.all('/api/*rest', (_req, res) => {
    res.sendStatus(status)
  })
  await sendRequest(app, method, `/api${path}`)
  return clears
}

test.serial('successful writes to card data clear the cache', async (t) => {
  for (const [method, path] of [
    ['POST', '/cards/some-card'],
    ['PUT', '/cards'],
    ['DELETE', '/cards-in-packs'],
    ['PUT', '/packs/import'],
    ['PUT', '/packs/rotate/core'],
    ['PUT', '/cycles/rotate/core'],
    ['PUT', '/formats'],
  ] as const) {
    t.is(await request(method, path), 1, `${method} ${path}`)
  }
})

test.serial('reads, failed writes and other writes keep the cache', async (t) => {
  t.is(await request('GET', '/cards'), 0, 'read')
  t.is(await request('PUT', '/formats', 400), 0, 'failed write')
  t.is(await request('POST', '/decklists/validate'), 0, 'validation')
  t.is(await request('PUT', '/decklists'), 0, 'deck write')
  t.is(await request('PUT', '/rulings'), 0, 'ruling write')
})
