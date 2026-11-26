import React, { createContext, ReactNode, type JSX } from 'react'
import { useNavigate } from 'react-router'
import { Auth0Provider } from '@auth0/auth0-react'
import { useAuth0Config } from '../hooks/useAuth0Config'
import { Paper, Typography } from '@mui/material'

export const Auth0Context = createContext<{ domain: string; clientId: string }>({
  domain: 'undefined',
  clientId: 'undefined',
})

export function Auth0ProviderWithHistory(props: {
  audience: string
  scope: string
  children: ReactNode
}): JSX.Element {
  const navigate = useNavigate()
  const [auth0Config] = useAuth0Config()
  if (auth0Config.loading) {
    return <Typography>Loading ...</Typography>
  }
  const auth0Domain: string = auth0Config.data?.domain || 'undefined'
  const auth0ClientId: string = auth0Config.data?.clientId || 'undefined'

  // Auth0 sends the user back to the start page; continue on the page they logged in from.
  // replace drops the start page with Auth0's ?code= from the history.
  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || '/cards', { replace: true })
  }

  const redirectUri = window.location.origin.includes('localhost')
    ? window.location.origin
    : window.location.origin.replace('http://', 'https://')
  return (
    <Paper>
      {auth0Domain && auth0ClientId && (
        <Auth0Context.Provider value={{ domain: auth0Domain, clientId: auth0ClientId }}>
          <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            authorizationParams={{
              redirect_uri: redirectUri,
              audience: props.audience,
              scope: props.scope,
            }}
            cacheLocation="localstorage"
            useRefreshTokens
            useRefreshTokensFallback
            onRedirectCallback={onRedirectCallback}
          >
            {props.children}
          </Auth0Provider>
        </Auth0Context.Provider>
      )}
    </Paper>
  )
}
