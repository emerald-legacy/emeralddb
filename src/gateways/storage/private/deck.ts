import { pg } from './pg'
import { Deck } from '@5rdb/api'
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

/**
 * Inserts the deck unless one with its id exists already, also when two requests insert
 * the same id at once. Returns the deck with that id and whether this call inserted it.
 */
export async function insertDeckOnce(deck: Deck): Promise<{ deck: Deck; inserted: boolean }> {
  const [inserted] = await pg(TABLE).insert(deck, '*').onConflict('id').ignore()
  if (inserted) {
    return { deck: inserted, inserted: true }
  }
  const existing = await getDeck(deck.id)
  if (!existing) {
    throw new Error(`Deck ${deck.id} was deleted while it was saved again`)
  }
  return { deck: existing, inserted: false }
}

export async function deleteDeck(deckId: string): Promise<void> {
  const decklists = await getAllDecklistsForDeck(deckId)
  for (const decklist of decklists) {
    await deleteDecklist(decklist.id)
  }
  await pg(TABLE).where('id', deckId).delete()
}
