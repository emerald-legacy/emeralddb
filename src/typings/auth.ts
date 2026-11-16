// Payload of the Auth0 access token, as decoded by express-jwt (authorizedOnly)
export interface Auth0User {
  iss: string
  sub: string
  aud: string[]
  iat: number
  exp: number
  azp: string
  scope: string
}
