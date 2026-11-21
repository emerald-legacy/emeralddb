type AccessTokenGetter = () => Promise<string | undefined>

let accessTokenGetter: AccessTokenGetter | undefined
let markReady: () => void = () => {}
const ready = new Promise<void>((resolve) => {
  markReady = resolve
})

// Called by UserProvider with Auth0's getAccessTokenSilently
export function setAccessTokenGetter(getter: AccessTokenGetter): void {
  accessTokenGetter = getter
  markReady()
}

// The access token for one request. Auth0 returns it from its cache and gets a new one
// when it has expired, so the token is never kept outside Auth0. Requests that start
// before Auth0 is set up wait for it. Rejects when the user isn't logged in (anymore).
export async function getAccessToken(): Promise<string | undefined> {
  await ready
  if (!accessTokenGetter) {
    throw new Error('Auth0 is not set up')
  }
  return accessTokenGetter()
}
