import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@mui/material'
import { useContext, type JSX } from 'react'
import { Auth0Context } from '../../providers/Auth0ProviderWithHistory'
import { unsetToken } from '../../utils/auth'

export function LogoutButton(props: { onLogout: () => void }): JSX.Element {
  const { logout } = useAuth0()
  const auth0Config = useContext(Auth0Context)
  return (
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={() => {
        unsetToken()
        props.onLogout()
        logout({
          logoutParams: {
            returnTo: window.location.origin + '/cards',
          },
        })
      }}
    >
      Log Out
    </Button>
  )
}
