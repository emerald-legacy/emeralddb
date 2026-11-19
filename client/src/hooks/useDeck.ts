import { publicApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useDeck = createApiHook((deckId: string) => publicApi.Deck.find({ deckId }))
