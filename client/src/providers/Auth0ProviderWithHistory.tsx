import { ReactNode, type JSX } from 'react'
import { useNavigate } from 'react-router'
import { Auth0Provider } from '@auth0/auth0-react'
import { useAuth0Config } from '../hooks/useAuth0Config'
import { Button, Paper, Typography } from '@mui/material'
import { RequestError } from '../components/RequestError'

const SCOPE = 'read:current_user'

export function Auth0ProviderWithHistory(props: { children: ReactNode }): JSX.Element {
  const navigate = useNavigate()
  const [auth0Config, reloadAuth0Config] = useAuth0Config()
  if (auth0Config.loading) {
    return <Typography>Loading ...</Typography>
  }
  // Without the configuration, logging in can't work: say so instead of sending the
  // user to a login page that doesn't exist
  if (!auth0Config.data) {
    return (
      <Paper>
        <RequestError
          requestError={`The login settings couldn't be loaded: ${auth0Config.error ?? 'no data'}`}
        />
        <Button variant="contained" color="secondary" onClick={reloadAuth0Config}>
          Retry
        </Button>
      </Paper>
    )
  }
  // The audience comes from the server, which checks the tokens against it
  const { domain, clientId, audience } = auth0Config.data

  // Auth0 sends the user back to the start page; continue on the page they logged in from.
  // replace drops the start page with Auth0's ?code= from the history.
  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || '/cards', { replace: true })
  }

  return (
    <Paper>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
          scope: SCOPE,
        }}
        cacheLocation="localstorage"
        useRefreshTokens
        onRedirectCallback={onRedirectCallback}
      >
        {props.children}
      </Auth0Provider>
    </Paper>
  )
}
