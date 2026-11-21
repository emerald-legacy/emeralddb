import test from 'ava'
import { ApiError, privateApi, publicApi } from './api'
import { setAccessTokenGetter } from './utils/accessToken'

interface SentRequest {
  url: string
  authorization: string | undefined
}

// Replaces fetch for one test and records what was sent
function stubFetch(): SentRequest[] {
  const sent: SentRequest[] = []
  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers)
    sent.push({ url: String(input), authorization: headers.get('Authorization') ?? undefined })
    return new Response(JSON.stringify({ id: 'auth0|someone', name: 'Someone', roles: [] }))
  }
  return sent
}

// The client logs failed renewals; keep the test output clean
function silenceConsoleError(t: { teardown: (fn: () => void) => void }): void {
  const original = console.error
  console.error = () => {}
  t.teardown(() => {
    console.error = original
  })
}

function auth0Error(code: string): Error {
  return Object.assign(new Error(code), { error: code })
}

// Serial: the token getter and fetch are global
test.serial('a request that needs a login waits until Auth0 is set up', async (t) => {
  const sent = stubFetch()
  const request = privateApi.User.current()
  await new Promise((resolve) => setTimeout(resolve, 10))
  t.is(sent.length, 0)

  setAccessTokenGetter(async () => 'first-token')
  await request
  t.deepEqual(sent, [{ url: '/api/users/me', authorization: 'Bearer first-token' }])
})

test.serial('each request gets a fresh token from Auth0 (regression)', async (t) => {
  const sent = stubFetch()
  const tokens = ['token-1', 'token-2']
  setAccessTokenGetter(async () => tokens.shift() ?? 'no token left')
  await privateApi.User.current()
  await privateApi.User.current()
  t.deepEqual(
    sent.map((request) => request.authorization),
    ['Bearer token-1', 'Bearer token-2']
  )
})

test.serial('an expired login is a 401 and nothing is sent', async (t) => {
  silenceConsoleError(t)
  const sent = stubFetch()
  setAccessTokenGetter(async () => {
    throw auth0Error('login_required')
  })
  const error = await t.throwsAsync(privateApi.User.current(), { instanceOf: ApiError })
  t.is(error?.status, 401)
  t.is(error?.message, 'You are not logged in anymore. Please log in again.')
  t.is(sent.length, 0)
})

test.serial('Auth0 not answering is like a network failure, not a logout', async (t) => {
  silenceConsoleError(t)
  const sent = stubFetch()
  setAccessTokenGetter(async () => {
    throw auth0Error('timeout')
  })
  const error = await t.throwsAsync(privateApi.User.current(), { instanceOf: ApiError })
  t.is(error?.status, 0)
  t.is(sent.length, 0)
})

test.serial('public requests send no token and never ask Auth0', async (t) => {
  const sent = stubFetch()
  let asked = false
  setAccessTokenGetter(async () => {
    asked = true
    return 'token'
  })
  await publicApi.Format.findAll()
  t.false(asked)
  t.is(sent[0].authorization, undefined)
})
