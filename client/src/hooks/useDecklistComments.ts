import { publicApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useDecklistComments = createApiHook((decklistId: string) =>
  publicApi.Decklist.findComments({ decklistId })
)
