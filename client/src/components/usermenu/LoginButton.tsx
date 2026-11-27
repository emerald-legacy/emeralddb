import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@mui/material'

import type { JSX } from 'react'

export function LoginButton(): JSX.Element {
  const { loginWithRedirect } = useAuth0()

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() =>
        loginWithRedirect({
          // Back to this page after logging in (see onRedirectCallback). Audience and
          // scope come from Auth0Provider.
          appState: { returnTo: window.location.pathname + window.location.search },
        })
      }
    >
      Log In
    </Button>
  )
}
