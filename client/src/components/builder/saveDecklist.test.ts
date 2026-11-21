import test from 'ava'
import { ApiError } from '../../apiError'
import { attemptFor, DeckApi, DecklistToSave, SaveAttempt, saveDecklist } from './saveDecklist'

const decklist: DecklistToSave = {
  format: 'emerald',
  name: 'My Deck',
  version_number: '0.1',
  cards: { 'some-card': 3 },
}

const attempt: SaveAttempt = { content: 'saved content', deckId: 'deck-id', decklistId: 'list-id' }

function fakeApi(options: { decklistFails?: Error; deleteFails?: boolean } = {}) {
  const calls: string[] = []
  const api: DeckApi = {
    async createDeck(deckId) {
      calls.push(`create deck ${deckId}`)
      return { id: deckId }
    },
    async deleteDeck(deckId) {
      calls.push(`delete deck ${deckId}`)
      if (options.deleteFails) throw new Error('delete failed')
    },
    async createDecklist(body) {
      calls.push(`create decklist ${body.id} in ${body.deck_id}`)
      if (options.decklistFails) throw options.decklistFails
    },
  }
  return { api, calls }
}

const refused = new ApiError(400, 'Invalid deck', 'Request failed with status code 400')
const networkFailure = new ApiError(0, undefined, 'Failed to fetch')

test('a new version of an existing deck is saved to that deck', async (t) => {
  const { api, calls } = fakeApi()
  t.is(await saveDecklist(api, decklist, attempt, 'existing-deck'), 'existing-deck')
  t.deepEqual(calls, ['create decklist list-id in existing-deck'])
})

test('a new deck is created with its first version, both with the ids of the attempt', async (t) => {
  const { api, calls } = fakeApi()
  t.is(await saveDecklist(api, decklist, attempt), 'deck-id')
  t.deepEqual(calls, ['create deck deck-id', 'create decklist list-id in deck-id'])
})

test('a refused first version deletes the empty deck and rejects (regression)', async (t) => {
  const { api, calls } = fakeApi({ decklistFails: refused })
  await t.throwsAsync(saveDecklist(api, decklist, attempt), { is: refused })
  t.deepEqual(calls, [
    'create deck deck-id',
    'create decklist list-id in deck-id',
    'delete deck deck-id',
  ])
})

test('after a network failure the new deck stays, the version may have been saved', async (t) => {
  const { api, calls } = fakeApi({ decklistFails: networkFailure })
  await t.throwsAsync(saveDecklist(api, decklist, attempt), { is: networkFailure })
  t.deepEqual(calls, ['create deck deck-id', 'create decklist list-id in deck-id'])
})

test('a failed version of an existing deck rejects and deletes nothing', async (t) => {
  const { api, calls } = fakeApi({ decklistFails: refused })
  await t.throwsAsync(saveDecklist(api, decklist, attempt, 'existing-deck'))
  t.deepEqual(calls, ['create decklist list-id in existing-deck'])
})

test('if deleting the empty deck fails too, the save error is reported', async (t) => {
  const { api } = fakeApi({ decklistFails: refused, deleteFails: true })
  const originalWarn = console.warn
  console.warn = () => undefined
  t.teardown(() => {
    console.warn = originalWarn
  })
  await t.throwsAsync(saveDecklist(api, decklist, attempt), { is: refused })
})

function counter() {
  let count = 0
  return () => `id-${++count}`
}

test('saving the same content again reuses the ids, so the server saves it once', (t) => {
  const newId = counter()
  const first = attemptFor(undefined, 'content', newId)
  t.deepEqual(first, { content: 'content', deckId: 'id-1', decklistId: 'id-2' })
  t.is(attemptFor(first, 'content', newId), first)
})

test('saving other content gets new ids', (t) => {
  const newId = counter()
  const first = attemptFor(undefined, 'content', newId)
  t.deepEqual(attemptFor(first, 'changed content', newId), {
    content: 'changed content',
    deckId: 'id-3',
    decklistId: 'id-4',
  })
})

test('the default ids are UUIDs, as the server requires', (t) => {
  const { deckId, decklistId } = attemptFor(undefined, 'content')
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  t.regex(deckId, uuid)
  t.regex(decklistId, uuid)
  t.not(deckId, decklistId)
})
