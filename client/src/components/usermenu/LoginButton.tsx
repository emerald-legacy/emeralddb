import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@mui/material'

import type { JSX } from 'react'

export function LoginButton(props: { audience: string; scope: string }): JSX.Element {
  const { loginWithRedirect } = useAuth0()

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() =>
        loginWithRedirect({
          authorizationParams: {
            audience: props.audience,
            scope: props.scope,
          },
        })
      }
    >
      Log In
    </Button>
  )
}
