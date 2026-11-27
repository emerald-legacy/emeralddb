import type { Decklists$create } from '@5rdb/api'
import { ApiError } from '../../apiError'

export type DecklistToSave = Omit<Decklists$create['request']['body'], 'id' | 'deck_id'>

/** The requests saving needs; the builder passes the real API, tests a fake */
export interface DeckApi {
  createDeck(deckId: string): Promise<{ id: string }>
  deleteDeck(deckId: string): Promise<unknown>
  createDecklist(body: Decklists$create['request']['body']): Promise<unknown>
}

/**
 * The ids one save sends. The server saves each id once, so sending the same ids again
 * is safe: a retry after an error or a second click returns what was saved first.
 */
export interface SaveAttempt {
  /** What is saved, to tell whether a save repeats the previous one */
  content: string
  deckId: string
  decklistId: string
}

/**
 * The ids for saving `content`: those of the previous attempt if it saved the same
 * content, new ones otherwise. After a successful save the version number goes up, so
 * the next save gets new ids.
 */
export function attemptFor(
  previous: SaveAttempt | undefined,
  content: string,
  newId: () => string = () => crypto.randomUUID()
): SaveAttempt {
  if (previous?.content === content) {
    return previous
  }
  return { content, deckId: newId(), decklistId: newId() }
}

/**
 * Saves a decklist as a new version of the given deck, or as the first version of a new
 * deck. Returns the deck's id and rejects with the error of the failed request.
 *
 * If the server refuses the first version of a new deck, the deck is deleted again: a deck
 * without versions would stay behind empty in "My Decks". Not after a network failure:
 * the version may have been saved, and a retry with the same ids completes the deck.
 */
export async function saveDecklist(
  api: DeckApi,
  decklist: DecklistToSave,
  attempt: SaveAttempt,
  existingDeckId?: string
): Promise<string> {
  if (existingDeckId) {
    await api.createDecklist({ ...decklist, id: attempt.decklistId, deck_id: existingDeckId })
    return existingDeckId
  }
  const { id: deckId } = await api.createDeck(attempt.deckId)
  try {
    await api.createDecklist({ ...decklist, id: attempt.decklistId, deck_id: deckId })
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      await api.deleteDeck(deckId).catch((deleteError: unknown) => {
        console.warn(`Could not delete the empty deck ${deckId}`, deleteError)
      })
    }
    throw error
  }
  return deckId
}
