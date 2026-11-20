import { publicApi } from '../api'
import { createApiHook } from '../utils/createApiHook'

export const useAuth0Config = createApiHook(publicApi.Auth0.get)
