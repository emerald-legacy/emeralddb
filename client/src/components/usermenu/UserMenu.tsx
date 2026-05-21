import { User } from '@5rdb/api'
import { useAuth0 } from '@auth0/auth0-react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material'
import { useState, useEffect, type JSX } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { privateApi } from '../../api'
import { getToken, hasAuth0Token, setToken } from '../../utils/auth'
import { Queries } from '../HeaderBar'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'
import { useCurrentUser } from '../../providers/UserProvider'
import AccountCircle from '@mui/icons-material/AccountCircle'

export function UserMenu(props: { audience: string; scope: string }): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalUsername, setModalUsername] = useState<string>()

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()

  const { currentUser, setCurrentUser } = useCurrentUser()

  const queryClient = useQueryClient()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const getUserToken = async () => {
      try {
        if (isAuthenticated && !isLoading && !getToken()) {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: props.audience,
              scope: props.scope,
            },
          })
          setToken(accessToken)
          queryClient.invalidateQueries({ queryKey: [Queries.USER] })
        }
      } catch (e) {
        console.error('Failed to get access token:', e)
      }
    }

    getUserToken()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, props.audience, props.scope, queryClient])

  if (currentUser !== undefined) {
    const updateUser = () => {
      privateApi.User.update({ body: { id: currentUser.id, name: modalUsername } }).then(
        (response) => {
          setCurrentUser(response.data() as unknown as User)
          setModalOpen(false)
        }
      )
    }
    return (
      <div style={{ float: 'right' }}>
        <IconButton
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
          size="large"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Logged in as: {currentUser.name}</MenuItem>
          <MenuItem>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => setModalOpen(true)}
            >
              Change username
            </Button>
          </MenuItem>
          <MenuItem>
            <LogoutButton onLogout={() => setCurrentUser(undefined)} />
          </MenuItem>
        </Menu>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogTitle id="form-dialog-title">Change Username</DialogTitle>
          <DialogContent>
            <TextField
              defaultValue={currentUser.name}
              value={modalUsername}
              onChange={(e) => setModalUsername(e.target.value)}
              label="New Username"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)} color="secondary" variant="contained">
              Close
            </Button>
            <Button variant="contained" color="secondary" onClick={() => updateUser()}>
              Change Username
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  if (isLoading || (isAuthenticated && !currentUser)) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <LoginButton audience={props.audience} scope={props.scope} />
    </div>
  )
}
