// Where the token used to be kept. Auth0's own cache replaces it; only removed now.
const LEGACY_TOKEN_KEY = '5RDB_Token'

export function removeLegacyToken(): void {
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // Storage can be blocked; there's nothing to remove then
  }
}
