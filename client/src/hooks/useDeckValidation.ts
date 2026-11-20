import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { DeckValidation, Decklists$validate } from '@5rdb/api'
import { publicApi } from '../api'
import useDebounce from './useDebounce'

// While cards are added or removed, wait for a pause before asking the server
const DEBOUNCE_MS = 300

type DeckToValidate = Decklists$validate['request']['body']

/**
 * The server's validation of a deck: errors, influence and deck size limits. The rules
 * live on the server only (POST /decklists/validate). While the deck changes, the last
 * result stays, so the display doesn't flicker.
 */
export function useDeckValidation(
  cards: Record<string, number>,
  format: string
): { validation: DeckValidation | undefined; failed: boolean } {
  // A snapshot that only changes with the deck's content: the builder sometimes changes
  // the cards object in place, and a new object on every render would restart the debounce
  const content = JSON.stringify({ cards, format })
  const snapshot = useMemo<DeckToValidate>(() => ({ cards: { ...cards }, format }), [content])
  const deck = useDebounce(snapshot, DEBOUNCE_MS)

  const { data, isError } = useQuery({
    // React Query compares keys by content
    queryKey: ['deckValidation', deck],
    queryFn: () => publicApi.Decklist.validate({ body: deck }).then((response) => response.data()),
    enabled: deck.format !== '',
    placeholderData: keepPreviousData,
  })
  return { validation: data, failed: isError }
}
