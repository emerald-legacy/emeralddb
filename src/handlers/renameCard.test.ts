import test from 'ava'
import type { Response } from 'express'
import type { Card } from '@5rdb/api'

process.env.DISCORD_CONFIG =
  process.env.DISCORD_CONFIG || JSON.stringify({ clientId: '', botToken: '', isBotEnabled: false })

interface CardStore {
  getCard: (id: string) => Promise<Card | undefined>
  insertOrUpdateCard: (card: Card) => Promise<Card>
  deleteCard: (id: string) => Promise<void>
}
interface RulingStore {
  getAllRulingsForCard: (id: string) => Promise<unknown[]>
}
interface CardInPackStore {
  getAllCardVersions: (id: string) => Promise<unknown[]>
}
interface DecklistStore {
  getAllDecklists: () => Promise<unknown[]>
}

const cardStore = require('../gateways/storage/private/card') as CardStore
const rulingStore = require('../gateways/storage/private/ruling') as RulingStore
const cardInPackStore = require('../gateways/storage/private/card_in_pack') as CardInPackStore
const decklistStore = require('../gateways/storage/private/decklist') as DecklistStore
const { handler } = require('./renameCard') as {
  handler: (req: { body: Record<string, string> }, res: Response) => Promise<Card | undefined>
}

const existing = {
  id: 'card-a',
  name: 'Old Name',
  name_extra: 'Old Extra',
  faction: 'crab',
  side: 'dynasty',
  type: 'character',
} as unknown as Card

function makeRes() {
  const statusCalls: number[] = []
  const sendCalls: unknown[] = []
  const res = {
    status(code: number) {
      statusCalls.push(code)
      return res
    },
    send(payload: unknown) {
      sendCalls.push(payload)
      return res
    },
  } as unknown as Response
  return { res, statusCalls, sendCalls }
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

  const { res, statusCalls } = makeRes()
  const result = await handler(
    {
      body: {
        existingCardId: 'card-a',
        newCardId: 'card-a',
        name: 'New Name',
        nameExtra: 'New Extra',
      },
    },
    res
  )

  t.is(inserted.length, 1)
  t.is(inserted[0].id, 'card-a')
  t.is(inserted[0].name, 'New Name')
  t.is(inserted[0].name_extra, 'New Extra')
  t.deepEqual(deleted, [], 'in-place edit must not delete the card')
  t.deepEqual(statusCalls, [])
  t.is(result?.id, 'card-a')
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

  const { res, statusCalls, sendCalls } = makeRes()
  const result = await handler(
    { body: { existingCardId: 'card-a', newCardId: 'card-b', name: 'X', nameExtra: '' } },
    res
  )

  t.deepEqual(statusCalls, [400])
  t.is(sendCalls.length, 1)
  t.is(inserted.length, 0, 'must not write when the target id belongs to another card')
  t.deepEqual(deleted, [])
  t.is(result, undefined)
})

test.serial('renaming a non-existent card is rejected with 400', async (t) => {
  let inserted = 0
  cardStore.getCard = async () => undefined
  cardStore.insertOrUpdateCard = async (card) => {
    inserted += 1
    return card
  }

  const { res, statusCalls } = makeRes()
  const result = await handler(
    { body: { existingCardId: 'nope', newCardId: 'x', name: 'X', nameExtra: '' } },
    res
  )

  t.deepEqual(statusCalls, [400])
  t.is(inserted, 0)
  t.is(result, undefined)
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

    const { res, statusCalls } = makeRes()
    const result = await handler(
      { body: { existingCardId: 'card-a', newCardId: 'card-b', name: 'New', nameExtra: '' } },
      res
    )

    t.is(inserted.length, 1)
    t.is(inserted[0].id, 'card-b')
    t.deepEqual(deleted, ['card-a'], 'old card is removed after migration')
    t.deepEqual(statusCalls, [])
    t.is(result?.id, 'card-b')
  }
)
