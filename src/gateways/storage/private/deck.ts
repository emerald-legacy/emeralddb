import { pg } from './pg'
import { Deck } from '@5rdb/api'
import { v4 as uuid } from 'uuid'
import { deleteDecklist, getAllDecklistsForDeck } from './decklist'

export const TABLE = 'decks'

export async function getAllDecks(): Promise<Deck[]> {
  return pg(TABLE).select()
}

export async function getDeck(deckId: string): Promise<Deck | undefined> {
  return pg(TABLE).where('id', deckId).first()
}

export async function getDecksForOwner(ownerId: string): Promise<Deck[]> {
  return pg(TABLE).where('owner_id', ownerId)
}

export async function insertDeck(deck: Omit<Deck, 'id'>): Promise<Deck> {
  const id = uuid()
  return pg(TABLE)
    .insert({ ...deck, id: id }, '*')
    .then(([row]) => row)
}

export async function deleteDeck(deckId: string): Promise<void> {
  const decklists = await getAllDecklistsForDeck(deckId)
  for (const decklist of decklists) {
    await deleteDecklist(decklist.id)
  }
  await pg(TABLE).where('id', deckId).delete()
}
