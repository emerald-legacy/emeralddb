import { privateApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useBetaEnvironment = createApiHook(privateApi.Beta.url)
