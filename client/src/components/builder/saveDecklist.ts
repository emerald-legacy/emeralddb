import type { Decklists$create } from '@5rdb/api'

export type DecklistToSave = Omit<Decklists$create['request']['body'], 'deck_id'>

/** The requests saving needs; the builder passes the real API, tests a fake */
export interface DeckApi {
  createDeck(): Promise<{ id: string }>
  deleteDeck(deckId: string): Promise<unknown>
  createDecklist(body: Decklists$create['request']['body']): Promise<unknown>
}

/**
 * Saves a decklist as a new version of the given deck, or as the first version of a new
 * deck. Returns the deck's id and rejects with the error of the failed request. If the
 * first version of a new deck can't be saved, the deck is deleted again: a deck without
 * versions would stay behind empty in "My Decks".
 */
export async function saveDecklist(
  api: DeckApi,
  decklist: DecklistToSave,
  existingDeckId?: string
): Promise<string> {
  if (existingDeckId) {
    await api.createDecklist({ ...decklist, deck_id: existingDeckId })
    return existingDeckId
  }
  const { id: deckId } = await api.createDeck()
  try {
    await api.createDecklist({ ...decklist, deck_id: deckId })
  } catch (error) {
    await api.deleteDeck(deckId).catch((deleteError: unknown) => {
      console.warn(`Could not delete the empty deck ${deckId}`, deleteError)
    })
    throw error
  }
  return deckId
}
