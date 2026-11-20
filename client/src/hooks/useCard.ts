import { publicApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useCard = createApiHook((cardId: string) => publicApi.Card.find({ cardId }))
