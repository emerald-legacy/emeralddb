import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { getToken, unsetToken } from './utils/auth'

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Global error handler - handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      unsetToken()
    }
    return Promise.reject(error)
  }
)

// Helper to create generic API response object
interface ApiResponse<T = any> {
  data: <D = T>() => D
  status: () => number
  error: () => string
}

function createResponse<T>(axiosResponse: AxiosResponse<T>): ApiResponse<T> {
  return {
    data: <D = T>() => axiosResponse.data as unknown as D,
    status: () => axiosResponse.status,
    error: () => '',
  }
}

function createErrorResponse(error: AxiosError): ApiResponse<any> {
  return {
    data: <D = any>() => error.response?.data as unknown as D,
    status: () => error.response?.status || 500,
    error: () => error.message || 'An error occurred',
  }
}

// Helper to replace path parameters
function replacePath(path: string, params: Record<string, any>): string {
  let result = path
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

// Helper to add auth header
function getHeaders(withAuth: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (withAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

// Generic API call function
async function apiCall<T>(
  method: string,
  path: string,
  params?: Record<string, any>,
  withAuth: boolean = false
): Promise<ApiResponse<T>> {
  try {
    const { body, ...pathParams } = params || {}
    const url = replacePath(path, pathParams)
    const config = {
      method,
      url,
      headers: getHeaders(withAuth),
      data: body,
    }

    const response = await axiosInstance.request<T>(config)
    return createResponse(response)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createErrorResponse(error)
    }
    throw error
  }
}

// API GET responses are cached by the browser for 5 minutes. Re-fetching with
// cache: 'reload' bypasses that cache and stores the fresh responses in it.
// Call this after every change for all GET paths whose data was affected.
//
// This is best effort and never rejects: the change itself has already succeeded
// when this runs, so a failed refresh must not turn into an error message for the user.
// Worst case, the stale entry expires on its own after 5 minutes.
export async function refreshCache(...paths: string[]): Promise<void> {
  const results = await Promise.allSettled(
    paths.map((path) => fetch(`/api${path}`, { cache: 'reload' }))
  )
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`Could not refresh cached response for /api${paths[index]}`, result.reason)
    }
  })
}

// Public API resources
export const publicApi = {
  Card: {
    findAll: (params?: any) => apiCall('GET', '/cards', params),
    find: (params?: any) => apiCall('GET', '/cards/{cardId}', params),
  },
  Pack: {
    findAll: (params?: any) => apiCall('GET', '/packs', params),
  },
  Cycle: {
    findAll: (params?: any) => apiCall('GET', '/cycles', params),
  },
  Format: {
    findAll: (params?: any) => apiCall('GET', '/formats', params),
  },
  Trait: {
    findAll: (params?: any) => apiCall('GET', '/traits', params),
  },
  Auth0: {
    get: (params?: any) => apiCall('GET', '/auth0', params),
  },
  Deck: {
    findForUser: (params?: any) => apiCall('POST', '/decks', params),
    find: (params?: any) => apiCall('GET', '/decks/{deckId}', params),
  },
  Decklist: {
    find: (params?: any) => apiCall('GET', '/decklists/{decklistId}', params),
    findPublished: (params?: any) => apiCall('GET', '/decklists', params),
    findComments: (params?: any) => apiCall('GET', '/decklists/{decklistId}/comments', params),
  },
}

// Private API resources (with authentication)
export const privateApi = {
  Data: {
    import: (params?: any) => apiCall('GET', '/import', params, true),
  },
  Beta: {
    url: (params?: any) => apiCall('GET', '/beta-url', params, true),
  },
  User: {
    current: (params?: any) => apiCall('GET', '/users/me', params, true),
    update: (params?: any) => apiCall('PUT', '/users/me', params, true),
  },
  Card: {
    update: (params?: any) => apiCall('POST', '/cards/{cardId}', params, true),
    create: (params?: any) => apiCall('PUT', '/cards', params, true),
    delete: (params?: any) => apiCall('DELETE', '/cards/{cardId}', params, true),
    rename: (params?: any) => apiCall('POST', '/cards/{cardId}/rename', params, true),
  },
  Ruling: {
    create: (params?: any) => apiCall('PUT', '/rulings', params, true),
    update: (params?: any) => apiCall('POST', '/rulings/{rulingId}', params, true),
    delete: (params?: any) => apiCall('DELETE', '/rulings/{rulingId}', params, true),
  },
  Decklist: {
    create: (params?: any) => apiCall('PUT', '/decklists', params, true),
    publish: (params?: any) => apiCall('POST', '/decklists/{decklistId}/publish', params, true),
    unpublish: (params?: any) => apiCall('POST', '/decklists/{decklistId}/unpublish', params, true),
    delete: (params?: any) => apiCall('DELETE', '/decklists/{decklistId}', params, true),
  },
  Deck: {
    create: (params?: any) => apiCall('PUT', '/decks', params, true),
    delete: (params?: any) => apiCall('DELETE', '/decks/{deckId}', params, true),
  },
  Pack: {
    create: (params?: any) => apiCall('PUT', '/packs', params, true),
    import: (params?: any) => apiCall('PUT', '/packs/import', params, true),
    rotate: (params?: any) => apiCall('PUT', '/packs/rotate/{packId}', params, true),
  },
  Cycle: {
    create: (params?: any) => apiCall('PUT', '/cycles', params, true),
    rotate: (params?: any) => apiCall('PUT', '/cycles/rotate/{cycleId}', params, true),
  },
  CardInPack: {
    updateAll: (params?: any) => apiCall('POST', '/cards-in-packs', params, true),
    update: (params?: any) => apiCall('PUT', '/cards-in-packs', params, true),
    delete: (params?: any) => apiCall('DELETE', '/cards-in-packs', params, true),
  },
  Format: {
    update: (params?: any) => apiCall('PUT', '/formats', params, true),
  },
  Comment: {
    create: (params?: any) => apiCall('PUT', '/comments', params, true),
    update: (params?: any) => apiCall('POST', '/comments/{id}', params, true),
    delete: (params?: any) => apiCall('DELETE', '/comments/{id}', params, true),
  },
  Trait: {
    update: (params?: any) => apiCall('PUT', '/traits', params, true),
    delete: (params?: any) => apiCall('DELETE', '/traits', params, true),
  },
}
