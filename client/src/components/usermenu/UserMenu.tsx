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
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type JSX } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { errorMessage, privateApi, refreshCache } from '../../api'
import { UiStoreQueries } from '../../providers/UiStoreProvider'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'
import { useCurrentUser } from '../../providers/UserProvider'
import AccountCircle from '@mui/icons-material/AccountCircle'

export function UserMenu(): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalUsername, setModalUsername] = useState<string>()

  const { isAuthenticated, isLoading } = useAuth0()

  const { currentUser, setCurrentUser, userError, retryUser } = useCurrentUser()
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (currentUser !== undefined) {
    const updateUser = () => {
      privateApi.User.update({
        body: { name: modalUsername ?? currentUser.name },
      })
        .then(async (response) => {
          setCurrentUser(response.data())
          setModalOpen(false)
          // The username is part of the published decklists
          await refreshCache('/decklists')
          queryClient.invalidateQueries({ queryKey: UiStoreQueries.PUBLISHED_DECKLISTS })
        })
        .catch((error) => {
          enqueueSnackbar(`The username couldn't be changed: ${errorMessage(error)}`, {
            variant: 'error',
          })
        })
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

  // Logged in at Auth0, but the account couldn't be loaded (server down, ...)
  if (isAuthenticated && userError) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" title={userError}>
          Your account couldn't be loaded.
        </Typography>
        <Button variant="contained" color="secondary" onClick={retryUser}>
          Retry
        </Button>
        <LogoutButton onLogout={() => setCurrentUser(undefined)} />
      </Stack>
    )
  }

  if (isLoading || (isAuthenticated && !currentUser)) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <LoginButton />
    </div>
  )
}
