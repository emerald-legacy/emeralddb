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

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    let location = appState?.returnTo || window.location.pathname
    navigate(location + 'cards')
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
            onRedirectCallback={onRedirectCallback}
          >
            {props.children}
          </Auth0Provider>
        </Auth0Context.Provider>
      )}
    </Paper>
  )
}
