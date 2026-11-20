import { publicApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useDecklist = createApiHook((decklistId: string) =>
  publicApi.Decklist.find({ decklistId })
)
