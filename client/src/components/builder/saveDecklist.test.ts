import test from 'ava'
import { DeckApi, DecklistToSave, saveDecklist } from './saveDecklist'

const decklist: DecklistToSave = {
  format: 'emerald',
  name: 'My Deck',
  version_number: '0.1',
  cards: { 'some-card': 3 },
}

function fakeApi(options: { decklistFails?: boolean; deleteFails?: boolean } = {}) {
  const calls: string[] = []
  const api: DeckApi = {
    async createDeck() {
      calls.push('create deck')
      return { id: 'new-deck' }
    },
    async deleteDeck(deckId) {
      calls.push(`delete deck ${deckId}`)
      if (options.deleteFails) throw new Error('delete failed')
    },
    async createDecklist(body) {
      calls.push(`create decklist in ${body.deck_id}`)
      if (options.decklistFails) throw new Error('Request failed with status code 400')
    },
  }
  return { api, calls }
}

test('a new version of an existing deck is saved to that deck', async (t) => {
  const { api, calls } = fakeApi()
  t.is(await saveDecklist(api, decklist, 'existing-deck'), 'existing-deck')
  t.deepEqual(calls, ['create decklist in existing-deck'])
})

test('a new deck is created with its first version', async (t) => {
  const { api, calls } = fakeApi()
  t.is(await saveDecklist(api, decklist), 'new-deck')
  t.deepEqual(calls, ['create deck', 'create decklist in new-deck'])
})

test('a failed first version deletes the empty deck and rejects (regression)', async (t) => {
  const { api, calls } = fakeApi({ decklistFails: true })
  await t.throwsAsync(saveDecklist(api, decklist), {
    message: 'Request failed with status code 400',
  })
  t.deepEqual(calls, ['create deck', 'create decklist in new-deck', 'delete deck new-deck'])
})

test('a failed version of an existing deck rejects and deletes nothing', async (t) => {
  const { api, calls } = fakeApi({ decklistFails: true })
  await t.throwsAsync(saveDecklist(api, decklist, 'existing-deck'))
  t.deepEqual(calls, ['create decklist in existing-deck'])
})

test('if deleting the empty deck fails too, the save error is reported', async (t) => {
  const { api } = fakeApi({ decklistFails: true, deleteFails: true })
  const originalWarn = console.warn
  console.warn = () => undefined
  t.teardown(() => {
    console.warn = originalWarn
  })
  await t.throwsAsync(saveDecklist(api, decklist), {
    message: 'Request failed with status code 400',
  })
})
