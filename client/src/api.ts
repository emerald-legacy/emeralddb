import { getToken, unsetToken } from './utils/auth'

const BASE_URL = '/api'

// Path parameters by name, plus an optional request body under `body`
type ApiParams = Record<string, unknown>

// Helper to create generic API response object
interface ApiResponse<T = unknown> {
  data: <D = T>() => D
  status: () => number
  error: () => string
}

function createResponse<T>(data: T, status: number, message: string = ''): ApiResponse<T> {
  return {
    data: <D = T>() => data as unknown as D,
    status: () => status,
    error: () => message,
  }
}

// Parse the body as JSON when possible and fall back to plain text,
// because the API sends error messages as plain text.
async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Helper to replace path parameters
function replacePath(path: string, params: ApiParams): string {
  let result = path
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

// Helper to add auth header
function getHeaders(withAuth: boolean, hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
  }
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (withAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

// Generic API call function. Resolves for 2xx responses and rejects with an
// ApiResponse for any other status or a network failure.
async function apiCall<T>(
  method: string,
  path: string,
  params?: ApiParams,
  withAuth: boolean = false
): Promise<ApiResponse<T>> {
  const { body, ...pathParams } = params || {}
  const url = BASE_URL + replacePath(path, pathParams)
  // Browsers don't allow a body on GET/HEAD requests
  const hasBody = body !== undefined && method !== 'GET' && method !== 'HEAD'

  let response: Response
  let data: unknown
  try {
    response = await fetch(url, {
      method,
      headers: getHeaders(withAuth, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    })
    data = await parseBody(response)
  } catch (error) {
    // Network failure or the body could not be read
    throw createResponse(undefined, 500, (error as Error)?.message || 'An error occurred')
  }

  if (!response.ok) {
    if (response.status === 401) {
      unsetToken()
    }
    throw createResponse(
      data,
      response.status,
      `Request failed with status code ${response.status}`
    )
  }
  return createResponse(data as T, response.status)
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
    findAll: (params?: ApiParams) => apiCall('GET', '/cards', params),
    find: (params?: ApiParams) => apiCall('GET', '/cards/{cardId}', params),
  },
  Pack: {
    findAll: (params?: ApiParams) => apiCall('GET', '/packs', params),
  },
  Cycle: {
    findAll: (params?: ApiParams) => apiCall('GET', '/cycles', params),
  },
  Format: {
    findAll: (params?: ApiParams) => apiCall('GET', '/formats', params),
  },
  Trait: {
    findAll: (params?: ApiParams) => apiCall('GET', '/traits', params),
  },
  Auth0: {
    get: (params?: ApiParams) => apiCall('GET', '/auth0', params),
  },
  Deck: {
    findForUser: (params?: ApiParams) => apiCall('POST', '/decks', params),
    find: (params?: ApiParams) => apiCall('GET', '/decks/{deckId}', params),
  },
  Decklist: {
    find: (params?: ApiParams) => apiCall('GET', '/decklists/{decklistId}', params),
    findPublished: (params?: ApiParams) => apiCall('GET', '/decklists', params),
    findComments: (params?: ApiParams) =>
      apiCall('GET', '/decklists/{decklistId}/comments', params),
  },
}

// Private API resources (with authentication)
export const privateApi = {
  Data: {
    import: (params?: ApiParams) => apiCall('GET', '/import', params, true),
  },
  Beta: {
    url: (params?: ApiParams) => apiCall('GET', '/beta-url', params, true),
  },
  User: {
    current: (params?: ApiParams) => apiCall('GET', '/users/me', params, true),
    update: (params?: ApiParams) => apiCall('PUT', '/users/me', params, true),
  },
  Card: {
    update: (params?: ApiParams) => apiCall('POST', '/cards/{cardId}', params, true),
    create: (params?: ApiParams) => apiCall('PUT', '/cards', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/cards/{cardId}', params, true),
    rename: (params?: ApiParams) => apiCall('POST', '/cards/{cardId}/rename', params, true),
  },
  Ruling: {
    create: (params?: ApiParams) => apiCall('PUT', '/rulings', params, true),
    update: (params?: ApiParams) => apiCall('POST', '/rulings/{rulingId}', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/rulings/{rulingId}', params, true),
  },
  Decklist: {
    create: (params?: ApiParams) => apiCall('PUT', '/decklists', params, true),
    publish: (params?: ApiParams) =>
      apiCall('POST', '/decklists/{decklistId}/publish', params, true),
    unpublish: (params?: ApiParams) =>
      apiCall('POST', '/decklists/{decklistId}/unpublish', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/decklists/{decklistId}', params, true),
  },
  Deck: {
    create: (params?: ApiParams) => apiCall('PUT', '/decks', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/decks/{deckId}', params, true),
  },
  Pack: {
    create: (params?: ApiParams) => apiCall('PUT', '/packs', params, true),
    import: (params?: ApiParams) => apiCall('PUT', '/packs/import', params, true),
    rotate: (params?: ApiParams) => apiCall('PUT', '/packs/rotate/{packId}', params, true),
  },
  Cycle: {
    create: (params?: ApiParams) => apiCall('PUT', '/cycles', params, true),
    rotate: (params?: ApiParams) => apiCall('PUT', '/cycles/rotate/{cycleId}', params, true),
  },
  CardInPack: {
    updateAll: (params?: ApiParams) => apiCall('POST', '/cards-in-packs', params, true),
    update: (params?: ApiParams) => apiCall('PUT', '/cards-in-packs', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/cards-in-packs', params, true),
  },
  Format: {
    update: (params?: ApiParams) => apiCall('PUT', '/formats', params, true),
  },
  Comment: {
    create: (params?: ApiParams) => apiCall('PUT', '/comments', params, true),
    update: (params?: ApiParams) => apiCall('POST', '/comments/{id}', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/comments/{id}', params, true),
  },
  Trait: {
    update: (params?: ApiParams) => apiCall('PUT', '/traits', params, true),
    delete: (params?: ApiParams) => apiCall('DELETE', '/traits', params, true),
  },
}
