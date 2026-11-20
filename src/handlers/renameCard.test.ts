import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Card } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { makeCard, sendRequest } from '../testUtils'
import { handler } from './renameCard'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. The handler sees the stubs through the re-exports in gateways/storage.
import cardStore = require('../gateways/storage/private/card')
import rulingStore = require('../gateways/storage/private/ruling')
import cardInPackStore = require('../gateways/storage/private/card_in_pack')
import decklistStore = require('../gateways/storage/private/decklist')

const existing = makeCard({
  id: 'card-a',
  name: 'Old Name',
  name_extra: 'Old Extra',
  faction: 'crab',
  side: 'dynasty',
  type: 'character',
})

function rename(body: Record<string, string>) {
  const app = express()
  app.use(express.json())
  app.post('/rename', asyncHandler(handler))
  return sendRequest(app, 'POST', '/rename', body)
}

test.serial('in-place edit keeps the id, updates name, and never deletes the card', async (t) => {
  const inserted: Card[] = []
  const deleted: string[] = []
  cardStore.getCard = async (id) => (id === 'card-a' ? { ...existing } : undefined)
  cardStore.insertOrUpdateCard = async (card) => {
    inserted.push(card)
    return card
  }
  cardStore.deleteCard = async (id) => {
    deleted.push(id)
  }

  const response = await rename({
    existingCardId: 'card-a',
    newCardId: 'card-a',
    name: 'New Name',
    nameExtra: 'New Extra',
  })

  t.is(inserted.length, 1)
  t.is(inserted[0].id, 'card-a')
  t.is(inserted[0].name, 'New Name')
  t.is(inserted[0].name_extra, 'New Extra')
  t.deepEqual(deleted, [], 'in-place edit must not delete the card')
  t.is(response.status, 200)
  t.like(response.body, { id: 'card-a' })
})

test.serial('renaming onto a different existing card is rejected with 400', async (t) => {
  const inserted: Card[] = []
  const deleted: string[] = []
  cardStore.getCard = async (id) => {
    if (id === 'card-a') return { ...existing }
    if (id === 'card-b') return { ...existing, id: 'card-b' }
    return undefined
  }
  cardStore.insertOrUpdateCard = async (card) => {
    inserted.push(card)
    return card
  }
  cardStore.deleteCard = async (id) => {
    deleted.push(id)
  }

  const response = await rename({
    existingCardId: 'card-a',
    newCardId: 'card-b',
    name: 'X',
    nameExtra: '',
  })

  t.is(response.status, 400)
  t.is(response.body, 'Card with id card-b already exists.')
  t.is(inserted.length, 0, 'must not write when the target id belongs to another card')
  t.deepEqual(deleted, [])
})

test.serial('renaming a non-existent card is rejected with 400', async (t) => {
  let inserted = 0
  cardStore.getCard = async () => undefined
  cardStore.insertOrUpdateCard = async (card) => {
    inserted += 1
    return card
  }

  const response = await rename({
    existingCardId: 'nope',
    newCardId: 'x',
    name: 'X',
    nameExtra: '',
  })

  t.is(response.status, 400)
  t.is(inserted, 0)
})

test.serial(
  'renaming to a free id creates the new card, migrates references, and deletes the old',
  async (t) => {
    const inserted: Card[] = []
    const deleted: string[] = []
    cardStore.getCard = async (id) => (id === 'card-a' ? { ...existing } : undefined)
    cardStore.insertOrUpdateCard = async (card) => {
      inserted.push(card)
      return card
    }
    cardStore.deleteCard = async (id) => {
      deleted.push(id)
    }
    rulingStore.getAllRulingsForCard = async () => []
    cardInPackStore.getAllCardVersions = async () => []
    decklistStore.getAllDecklists = async () => []

    const response = await rename({
      existingCardId: 'card-a',
      newCardId: 'card-b',
      name: 'New',
      nameExtra: '',
    })

    t.is(inserted.length, 1)
    t.is(inserted[0].id, 'card-b')
    t.deepEqual(deleted, ['card-a'], 'old card is removed after migration')
    t.is(response.status, 200)
    t.like(response.body, { id: 'card-b' })
  }
)
