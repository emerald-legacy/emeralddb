import type {
  CardInPacks$delete,
  CardInPacks$insertOrUpdate,
  CardInPacks$updateAll,
  Cards$create,
  Cards$delete,
  Cards$find,
  Cards$findAll,
  Cards$rename,
  Cards$update,
  Config$auth0,
  Config$betaUrl,
  Cycles$create,
  Cycles$findAll,
  Cycles$rotate,
  DecklistComments$create,
  DecklistComments$delete,
  DecklistComments$findForDecklist,
  DecklistComments$update,
  Decklists$create,
  Decklists$delete,
  Decklists$find,
  Decklists$findAllPublished,
  Decklists$publish,
  Decklists$unpublish,
  Decklists$validate,
  Decks$create,
  Decks$delete,
  Decks$find,
  Decks$findForUser,
  Formats$findAll,
  Formats$insertOrUpdate,
  Pack$import,
  Pack$rotate,
  Packs$create,
  Packs$findAll,
  Ruling$create,
  Ruling$delete,
  Ruling$update,
  Traits$delete,
  Traits$findAll,
  Traits$insertOrUpdate,
  Users$me,
  Users$update,
} from '@5rdb/api'
import { ApiError } from './apiError'
import { getToken, unsetToken } from './utils/auth'

export { ApiError, errorMessage } from './apiError'

const BASE_URL = '/api'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// The shape of the endpoint contracts in @5rdb/api (Cards$find, Users$update, ...)
interface EndpointContract {
  request?: { params?: object; body?: unknown }
  response?: unknown
}

// The argument of an endpoint function: the path parameters by name, plus the body under `body`
type RequestOf<RequestContract> = (RequestContract extends { params: infer Params }
  ? Params
  : object) &
  (RequestContract extends { body: infer Body } ? { body: Body } : object)
// An endpoint without a request in its contract takes no argument
type RequestArgs<Contract extends EndpointContract> = Contract extends {
  request: infer RequestContract
}
  ? [request: RequestOf<RequestContract>]
  : []
// An endpoint without a response in its contract resolves to void
type ResponseOf<Contract extends EndpointContract> = Contract extends {
  response: infer ResponseBody
}
  ? ResponseBody
  : void

export interface ApiResponse<Data> {
  data: () => Data
  status: () => number
}

function createResponse<Data>(data: Data, status: number): ApiResponse<Data> {
  return {
    data: () => data,
    status: () => status,
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

// Splits the request into the path (with its parameters filled in) and the body
function buildRequest(path: string, request: unknown): { path: string; body: unknown } {
  if (typeof request !== 'object' || request === null) {
    return { path, body: undefined }
  }
  let result = path
  let body: unknown = undefined
  const entries: [string, unknown][] = Object.entries(request)
  for (const [key, value] of entries) {
    if (key === 'body') {
      body = value
    } else {
      result = result.replace(`{${key}}`, String(value))
    }
  }
  return { path: result, body }
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
// ApiError for any other status or a network failure.
async function apiCall<ResponseBody>(
  method: Method,
  path: string,
  request: unknown,
  withAuth: boolean
): Promise<ApiResponse<ResponseBody>> {
  const { path: filledPath, body } = buildRequest(path, request)
  const url = BASE_URL + filledPath
  // Browsers don't allow a body on GET requests
  const hasBody = body !== undefined && method !== 'GET'

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
    const message = error instanceof Error && error.message ? error.message : 'An error occurred'
    throw new ApiError(0, undefined, message)
  }

  if (!response.ok) {
    if (response.status === 401) {
      unsetToken()
    }
    throw new ApiError(response.status, data, `Request failed with status code ${response.status}`)
  }
  // The trust boundary: the response isn't validated at runtime. The server's
  // contract in @5rdb/api is trusted to describe what it sends.
  return createResponse(data as ResponseBody, response.status)
}

// Creates the function for one endpoint, typed by its contract from @5rdb/api
function endpoint<Contract extends EndpointContract>(
  method: Method,
  path: string,
  withAuth = false
) {
  return (...args: RequestArgs<Contract>): Promise<ApiResponse<ResponseOf<Contract>>> =>
    apiCall<ResponseOf<Contract>>(method, path, args[0], withAuth)
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
    findAll: endpoint<Cards$findAll>('GET', '/cards'),
    find: endpoint<Cards$find>('GET', '/cards/{cardId}'),
  },
  Pack: {
    findAll: endpoint<Packs$findAll>('GET', '/packs'),
  },
  Cycle: {
    findAll: endpoint<Cycles$findAll>('GET', '/cycles'),
  },
  Format: {
    findAll: endpoint<Formats$findAll>('GET', '/formats'),
  },
  Trait: {
    findAll: endpoint<Traits$findAll>('GET', '/traits'),
  },
  Auth0: {
    get: endpoint<Config$auth0>('GET', '/auth0'),
  },
  Deck: {
    find: endpoint<Decks$find>('GET', '/decks/{deckId}'),
  },
  Decklist: {
    find: endpoint<Decklists$find>('GET', '/decklists/{decklistId}'),
    findPublished: endpoint<Decklists$findAllPublished>('GET', '/decklists'),
    // Public, but a POST: the deck is sent in the body
    validate: endpoint<Decklists$validate>('POST', '/decklists/validate'),
    findComments: endpoint<DecklistComments$findForDecklist>(
      'GET',
      '/decklists/{decklistId}/comments'
    ),
  },
}

// Private API resources (with authentication)
export const privateApi = {
  Beta: {
    url: endpoint<Config$betaUrl>('GET', '/beta-url', true),
  },
  User: {
    current: endpoint<Users$me>('GET', '/users/me', true),
    update: endpoint<Users$update>('PUT', '/users/me', true),
  },
  Card: {
    update: endpoint<Cards$update>('POST', '/cards/{cardId}', true),
    create: endpoint<Cards$create>('PUT', '/cards', true),
    delete: endpoint<Cards$delete>('DELETE', '/cards/{cardId}', true),
    rename: endpoint<Cards$rename>('POST', '/cards/{cardId}/rename', true),
  },
  Ruling: {
    create: endpoint<Ruling$create>('PUT', '/rulings', true),
    update: endpoint<Ruling$update>('POST', '/rulings/{rulingId}', true),
    delete: endpoint<Ruling$delete>('DELETE', '/rulings/{rulingId}', true),
  },
  Decklist: {
    create: endpoint<Decklists$create>('PUT', '/decklists', true),
    publish: endpoint<Decklists$publish>('POST', '/decklists/{decklistId}/publish', true),
    unpublish: endpoint<Decklists$unpublish>('POST', '/decklists/{decklistId}/unpublish', true),
    delete: endpoint<Decklists$delete>('DELETE', '/decklists/{decklistId}', true),
  },
  Deck: {
    // The decks of the logged-in user
    findForUser: endpoint<Decks$findForUser>('POST', '/decks', true),
    create: endpoint<Decks$create>('PUT', '/decks', true),
    delete: endpoint<Decks$delete>('DELETE', '/decks/{deckId}', true),
  },
  Pack: {
    create: endpoint<Packs$create>('PUT', '/packs', true),
    import: endpoint<Pack$import>('PUT', '/packs/import', true),
    rotate: endpoint<Pack$rotate>('PUT', '/packs/rotate/{id}', true),
  },
  Cycle: {
    create: endpoint<Cycles$create>('PUT', '/cycles', true),
    rotate: endpoint<Cycles$rotate>('PUT', '/cycles/rotate/{id}', true),
  },
  CardInPack: {
    updateAll: endpoint<CardInPacks$updateAll>('POST', '/cards-in-packs', true),
    update: endpoint<CardInPacks$insertOrUpdate>('PUT', '/cards-in-packs', true),
    delete: endpoint<CardInPacks$delete>('DELETE', '/cards-in-packs', true),
  },
  Format: {
    update: endpoint<Formats$insertOrUpdate>('PUT', '/formats', true),
  },
  Comment: {
    create: endpoint<DecklistComments$create>('PUT', '/comments', true),
    update: endpoint<DecklistComments$update>('POST', '/comments/{id}', true),
    delete: endpoint<DecklistComments$delete>('DELETE', '/comments/{id}', true),
  },
  Trait: {
    update: endpoint<Traits$insertOrUpdate>('PUT', '/traits', true),
    delete: endpoint<Traits$delete>('DELETE', '/traits', true),
  },
}
