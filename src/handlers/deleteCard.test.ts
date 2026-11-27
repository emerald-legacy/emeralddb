import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Decklist } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { makeCard, sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as deleteCard from './deleteCard'
import { replaceCard } from './deleteCard'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import cardStore = require('../gateways/storage/private/card')
import cardInPackStore = require('../gateways/storage/private/card_in_pack')
import decklistStore = require('../gateways/storage/private/decklist')
import formatStore = require('../gateways/storage/private/formats')
import rulingStore = require('../gateways/storage/private/ruling')

function decklist(id: string, format: string, cards: Record<string, number>): Decklist {
  const cardPackIds = Object.fromEntries(
    Object.keys(cards).map((cardId) => [cardId, `${cardId}-pack`])
  )
  return {
    id,
    deck_id: id,
    format,
    name: id,
    version_number: '1.0',
    cards,
    card_pack_ids: cardPackIds,
    created_at: new Date('2026-01-01'),
    owner_id: 'owner',
  }
}

const replacement = { id: 'new-card', deck_limit: 3 }

test('the copies of the deleted card are added to the replacement (regression)', (t) => {
  const { cards } = replaceCard(
    { cards: { 'old-card': 1, 'new-card': 1, other: 2 } },
    'old-card',
    replacement,
    undefined
  )
  t.deepEqual(cards, { 'new-card': 2, other: 2 })
})

test('the replacement gets at most its deck limit', (t) => {
  const { cards } = replaceCard(
    { cards: { 'old-card': 2, 'new-card': 3 } },
    'old-card',
    replacement,
    undefined
  )
  t.deepEqual(cards, { 'new-card': 3 })
  const unique = replaceCard(
    { cards: { 'old-card': 2 } },
    'old-card',
    { id: 'u', deck_limit: 1 },
    undefined
  )
  t.deepEqual(unique.cards, { u: 1 })
})

test('a replacement the deck already had keeps its pack id', (t) => {
  const { cardPackIds } = replaceCard(
    {
      cards: { 'old-card': 1, 'new-card': 1 },
      card_pack_ids: { 'old-card': 'old-pack', 'new-card': 'deck-pack' },
    },
    'old-card',
    replacement,
    'legal-pack'
  )
  t.deepEqual(cardPackIds, { 'new-card': 'deck-pack' })
})

test("a new replacement gets a legal printing, not the deleted card's pack (regression)", (t) => {
  const { cardPackIds } = replaceCard(
    { cards: { 'old-card': 1 }, card_pack_ids: { 'old-card': 'old-pack' } },
    'old-card',
    replacement,
    'legal-pack'
  )
  t.deepEqual(cardPackIds, { 'new-card': 'legal-pack' })
})

test('without a legal printing, the replacement gets no pack id instead of an empty one', (t) => {
  const { cardPackIds } = replaceCard(
    { cards: { 'old-card': 1 }, card_pack_ids: { 'old-card': 'old-pack', other: 'p' } },
    'old-card',
    replacement,
    undefined
  )
  t.deepEqual(cardPackIds, { other: 'p' })
})

test('the decklist itself is not changed', (t) => {
  const decklist = { cards: { 'old-card': 1 }, card_pack_ids: { 'old-card': 'old-pack' } }
  replaceCard(decklist, 'old-card', replacement, 'legal-pack')
  t.deepEqual(decklist, { cards: { 'old-card': 1 }, card_pack_ids: { 'old-card': 'old-pack' } })
})

// --- the handler ----------------------------------------------------------------------

test.serial('deleting a card with a replacement updates every decklist that had it', async (t) => {
  const updates: Record<string, unknown> = {}
  const deletedCards: string[] = []
  cardStore.getCard = async (id) =>
    ['old-card', 'new-card'].includes(id) ? makeCard({ id, deck_limit: 3 }) : undefined
  cardStore.deleteCard = async (id) => {
    deletedCards.push(id)
  }
  rulingStore.getAllRulingsForCard = async () => []
  cardInPackStore.getAllCardVersions = async () => []
  cardInPackStore.getAllCardsInPacks = async () => [
    { card_id: 'new-card', pack_id: 'rotated-pack', rotated: true },
    { card_id: 'new-card', pack_id: 'emerald-pack', rotated: false },
    { card_id: 'new-card', pack_id: 'obsidian-pack', rotated: false },
  ]
  formatStore.getAllFormats = async () => [
    { id: 'emerald', name: 'Emerald', legal_packs: ['emerald-pack'], supported: true, position: 1 },
    {
      id: 'obsidian',
      name: 'Obsidian',
      legal_packs: ['obsidian-pack'],
      supported: true,
      position: 2,
    },
  ]
  // Like the table: later reads see the updates
  const decklists = [
    decklist('emerald-deck', 'emerald', { 'old-card': 2 }),
    decklist('obsidian-deck', 'obsidian', { 'old-card': 1, 'new-card': 1 }),
    decklist('unrelated-deck', 'emerald', { other: 3 }),
  ]
  decklistStore.getAllDecklists = async () => decklists.map((row) => ({ ...row }))
  decklistStore.updateCardsInDecklist = async (id, cards, cardPackIds) => {
    updates[id] = { cards, cardPackIds }
    const row = decklists.find((candidate) => candidate.id === id)
    if (row) {
      row.cards = cards
      row.card_pack_ids = cardPackIds
    }
    return row
  }

  const app = express()
  app.use(express.json())
  app.delete('/cards/:cardId', validate(deleteCard.schema), asyncHandler(deleteCard.handler))
  const response = await sendRequest(app, 'DELETE', '/cards/old-card', {
    replacementCardId: 'new-card',
  })

  t.is(response.status, 200)
  t.deepEqual(updates, {
    // Didn't have the replacement: a printing that is legal in Emerald
    'emerald-deck': { cards: { 'new-card': 2 }, cardPackIds: { 'new-card': 'emerald-pack' } },
    // Had it: its quantity grows, its pack id stays
    'obsidian-deck': { cards: { 'new-card': 2 }, cardPackIds: { 'new-card': 'new-card-pack' } },
  })
  t.deepEqual(deletedCards, ['old-card'])
})
