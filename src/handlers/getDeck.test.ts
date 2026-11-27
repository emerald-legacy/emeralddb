import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Decklist, DeckWithVersions } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { makeCard, sendRequest } from '../testUtils'
import * as getDeck from './getDeck'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import cardStore = require('../gateways/storage/private/card')
import deckStore = require('../gateways/storage/private/deck')
import decklistStore = require('../gateways/storage/private/decklist')

const cards = [
  makeCard({ id: 'crab-stronghold', type: 'stronghold' }),
  makeCard({ id: 'lion-stronghold', type: 'stronghold' }),
  makeCard({ id: 'keeper-role', type: 'role' }),
  makeCard({ id: 'some-character', type: 'character' }),
]

function version(id: string, cardIds: string[]): Decklist {
  return {
    id,
    deck_id: 'deck',
    format: 'emerald',
    name: 'A deck',
    version_number: '1.0',
    cards: Object.fromEntries(cardIds.map((cardId) => [cardId, 1])),
    created_at: new Date('2026-01-01'),
    owner_id: 'owner',
  }
}

test('the versions get their stronghold and role, with one card query (regression)', async (t) => {
  const cardQueries: string[][] = []
  deckStore.getDeck = async (id) => ({ id, owner_id: 'owner' })
  decklistStore.getDecklist = async () => undefined
  decklistStore.getAllDecklistsForDeck = async () => [
    version('v1', ['crab-stronghold', 'keeper-role', 'some-character']),
    version('v2', ['lion-stronghold', 'some-character']),
    version('v3', ['crab-stronghold']),
  ]
  cardStore.getCards = async (cardIds) => {
    cardQueries.push(cardIds)
    return cards.filter((card) => cardIds.includes(card.id))
  }

  const app = express()
  app.get('/decks/:deckId', asyncHandler(getDeck.handler))
  const response = await sendRequest(app, 'GET', '/decks/deck')
  t.is(response.status, 200)
  t.is(cardQueries.length, 1)
  const { versions } = response.body as DeckWithVersions
  t.deepEqual(
    versions.map((decklist) => [decklist.id, decklist.stronghold?.id, decklist.role?.id]),
    [
      ['v1', 'crab-stronghold', 'keeper-role'],
      ['v2', 'lion-stronghold', undefined],
      ['v3', 'crab-stronghold', undefined],
    ]
  )
})
