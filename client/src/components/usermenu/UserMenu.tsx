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
import { useState, type JSX } from 'react'
import { privateApi, refreshCache } from '../../api'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'
import { useCurrentUser } from '../../providers/UserProvider'
import AccountCircle from '@mui/icons-material/AccountCircle'

export function UserMenu(props: { audience: string; scope: string }): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalUsername, setModalUsername] = useState<string>()

  const { isAuthenticated, isLoading } = useAuth0()

  const { currentUser, setCurrentUser } = useCurrentUser()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (currentUser !== undefined) {
    const updateUser = () => {
      privateApi.User.update({
        body: { id: currentUser.id, name: modalUsername ?? currentUser.name },
      }).then((response) => {
        setCurrentUser(response.data())
        setModalOpen(false)
        // The username is part of the published decklists
        return refreshCache('/decklists')
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

  if (isLoading || (isAuthenticated && !currentUser)) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <LoginButton audience={props.audience} scope={props.scope} />
    </div>
  )
}
