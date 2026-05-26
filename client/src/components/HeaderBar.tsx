import {
  AppBar,
  IconButton,
  Collapse,
  Grid,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  TextField,
  Toolbar,
  useMediaQuery,
  Container,
  List,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { UserMenu } from './usermenu/UserMenu'
import { useNavigate } from 'react-router'
import { useCurrentUser } from '../providers/UserProvider'
import { useState, type JSX } from 'react'
import { CycleList } from './CycleList'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import MenuIcon from '@mui/icons-material/Menu'
import { EmeraldDBLink } from './EmeraldDBLink'

const PREFIX = 'HeaderBar'

const classes = {
  title: `${PREFIX}-title`,
  adminButton: `${PREFIX}-adminButton`,
  logo: `${PREFIX}-logo`,
  searchField: `${PREFIX}-searchField`,
}

const StyledAppBar = styled(AppBar)(() => ({
  [`& .${classes.title}`]: {
    flexGrow: 1,
  },

  [`& .${classes.adminButton}`]: {
    marginRight: 10,
  },

  [`& .${classes.logo}`]: {
    height: 45,
    marginRight: 5,
  },

  [`& .${classes.searchField}`]: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      borderRadius: '4px',
      fontSize: '0.875rem',
      height: '32px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '4px 8px',
    },
    '& .MuiInputAdornment-root': {
      marginLeft: '4px',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
    minWidth: 50,
    maxWidth: 180,
  },
}))

export enum Queries {
  USER = 'USER',
  CARDS = 'CARDS',
  PACKS = 'PACKS',
  CYCLES = 'CYCLES',
  TRAITS = 'TRAITS',
}

export function HeaderBar(props: { audience: string; scope: string }): JSX.Element {
  const navigate = useNavigate()
  const { isDataAdmin } = useCurrentUser()
  const [cardAnchorEl, setCardAnchorEl] = useState<null | HTMLElement>(null)
  const [rulesAnchorEl, setRulesAnchorEl] = useState<null | HTMLElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isMdOrSmaller = useMediaQuery('(max-width:960px)')
  const is1440PxOrBigger = useMediaQuery('(min-width:1440px)')

  const handleCardMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setCardAnchorEl(event.currentTarget)
  }

  const handleRulesMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setRulesAnchorEl(event.currentTarget)
  }

  const closeModalsAndPopUps = () => {
    setCardAnchorEl(null)
    setRulesAnchorEl(null)
    setIsMobileOpen(false)
  }

  const goTo = (route: string) => {
    closeModalsAndPopUps()
    navigate(route)
  }

  const listenToEnterDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const encodedString = encodeURIComponent(searchValue)
      goTo(`/cards?query=${encodedString}`)
    }
  }

  return (
    <StyledAppBar position="fixed">
      <Toolbar variant="dense">
        <Container maxWidth={false}>
          <Grid container justifyContent={'center'}>
            <Grid size={{ xs: 12, lg: is1440PxOrBigger ? 10 : 12, xl: 10 }}>
              <Grid container>
                <Grid size={{ xs: 11, sm: 11, md: 2, lg: 3, xl: 2 }}>
                  <EmeraldDBLink href={'/'} onClick={() => closeModalsAndPopUps()}>
                    <img
                      src="/static/logo.webp"
                      className={classes.logo}
                      alt="Emerald Legacy Logo"
                    />
                  </EmeraldDBLink>
                </Grid>
                {isMdOrSmaller && (
                  <Grid size={{ xs: 1, sm: 1 }}>
                    <IconButton
                      color="inherit"
                      onClick={() => setIsMobileOpen(!isMobileOpen)}
                      size="large"
                    >
                      <MenuIcon />
                    </IconButton>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 12, md: 10, lg: 9, xl: 10 }}>
                  <Collapse in={!isMdOrSmaller || isMobileOpen}>
                    <Grid
                      direction={isMdOrSmaller ? 'column' : 'row'}
                      container
                      justifyContent="flex-end"
                      alignItems={isMdOrSmaller ? 'flex-end' : 'center'}
                    >
                      <Grid>
                        <ListItemButton dense={isMdOrSmaller}>
                          <ListItemText
                            primary={
                              <EmeraldDBLink href="/cards" onClick={closeModalsAndPopUps}>
                                Cards
                              </EmeraldDBLink>
                            }
                          />
                          <span onClick={handleCardMenuClick}>
                            {cardAnchorEl ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </span>
                        </ListItemButton>
                        <Menu
                          anchorEl={cardAnchorEl}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          keepMounted
                          open={Boolean(cardAnchorEl)}
                          onClose={() => setCardAnchorEl(null)}
                          disableScrollLock
                        >
                          <div>
                            <CycleList
                              rootUrl="/cards"
                              cycleUrl="/cards?cycle="
                              packUrl="/cards?pack="
                              onClick={goTo}
                              rootLabel="View All Cards"
                            />
                          </div>
                        </Menu>
                      </Grid>
                      <Grid>
                        <ListItemButton dense={isMdOrSmaller}>
                          <ListItemText
                            primary={
                              <EmeraldDBLink href="/decks" onClick={closeModalsAndPopUps}>
                                Decks
                              </EmeraldDBLink>
                            }
                          />
                        </ListItemButton>
                      </Grid>
                      <Grid>
                        <ListItemButton dense={isMdOrSmaller}>
                          <ListItemText
                            primary={
                              <EmeraldDBLink href="/builder" onClick={closeModalsAndPopUps}>
                                Builder
                              </EmeraldDBLink>
                            }
                          />
                        </ListItemButton>
                      </Grid>
                      <Grid>
                        <ListItemButton dense={isMdOrSmaller} onClick={handleRulesMenuClick}>
                          <ListItemText
                            primary={
                              <EmeraldDBLink href="/rules" onClick={closeModalsAndPopUps}>
                                Rules
                              </EmeraldDBLink>
                            }
                          />
                          <span>{rulesAnchorEl ? <ExpandLessIcon /> : <ExpandMoreIcon />}</span>
                        </ListItemButton>
                        <Menu
                          anchorEl={rulesAnchorEl}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          keepMounted
                          open={Boolean(rulesAnchorEl)}
                          onClose={() => setRulesAnchorEl(null)}
                          disableScrollLock
                        >
                          <div>
                            <List dense>
                              <ListItem>
                                <EmeraldDBLink
                                  href="/rules/organized-play"
                                  onClick={closeModalsAndPopUps}
                                >
                                  <b>Restricted and Banned Lists</b>
                                </EmeraldDBLink>
                              </ListItem>
                              <ListItem>
                                <EmeraldDBLink
                                  href="/rules/organized-play/emerald"
                                  onClick={closeModalsAndPopUps}
                                >
                                  - Emerald Legacy
                                </EmeraldDBLink>
                              </ListItem>
                              <ListItem>
                                <EmeraldDBLink
                                  href="/rules/organized-play/standard"
                                  onClick={closeModalsAndPopUps}
                                >
                                  - Fantasy Flight Games
                                </EmeraldDBLink>
                              </ListItem>
                              <ListItem>
                                <EmeraldDBLink href="/rules/emerald" onClick={closeModalsAndPopUps}>
                                  <b>Emerald Legacy's RRG</b>
                                </EmeraldDBLink>
                              </ListItem>
                              <ListItem>
                                <EmeraldDBLink
                                  href="/rules/imperial"
                                  onClick={closeModalsAndPopUps}
                                >
                                  <b>Fantasy Flight Games' RRG</b>
                                </EmeraldDBLink>
                              </ListItem>
                            </List>
                          </div>
                        </Menu>
                      </Grid>
                      {isDataAdmin() && (
                        <Grid>
                          <ListItemButton dense={isMdOrSmaller}>
                            <ListItemText
                              primary={
                                <EmeraldDBLink href="/admin" onClick={closeModalsAndPopUps}>
                                  Admin
                                </EmeraldDBLink>
                              }
                            />
                          </ListItemButton>
                        </Grid>
                      )}
                      <Grid>
                        <ListItemButton dense={isMdOrSmaller}>
                          <ListItemText
                            primary={
                              <EmeraldDBLink href="/faq" onClick={closeModalsAndPopUps}>
                                FAQ
                              </EmeraldDBLink>
                            }
                          />
                        </ListItemButton>
                      </Grid>
                      <Grid>
                        <ListItem dense={isMdOrSmaller}>
                          <TextField
                            className={classes.searchField}
                            placeholder="Search Card..."
                            size="small"
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={listenToEnterDown}
                          />
                        </ListItem>
                      </Grid>
                      <Grid>
                        <UserMenu audience={props.audience} scope={props.scope} />
                      </Grid>
                      <Grid />
                    </Grid>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </StyledAppBar>
  )
}
