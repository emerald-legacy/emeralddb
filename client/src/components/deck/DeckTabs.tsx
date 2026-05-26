import { DeckWithVersions } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import { Box, Typography, Button, Grid, useMediaQuery, Tooltip } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import { useState, type JSX } from 'react'
import { privateApi } from '../../api'
import { CardFactionIcon } from '../card/CardFactionIcon'
import { DecklistTabs, latestDecklistForDeck } from './DecklistTabs'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LinkIcon from '@mui/icons-material/Link'
import { EmeraldDBLink } from '../EmeraldDBLink'
import { getFactionName } from '../../utils/factionUtils'
const PREFIX = 'DeckTabs'

const classes = {
  unselectedDeck: `${PREFIX}-unselectedDeck`,
  selectedDeck: `${PREFIX}-selectedDeck`,
  newDeckButton: `${PREFIX}-newDeckButton`,
  format: `${PREFIX}-format`,
  deleteButton: `${PREFIX}-deleteButton`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.unselectedDeck}`]: {
    borderColor: 'lightgrey',
  },

  [`& .${classes.selectedDeck}`]: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    borderRightWidth: '3px',
  },

  [`& .${classes.newDeckButton}`]: {
    marginBottom: 3,
  },

  [`& .${classes.format}`]: {
    fontSize: 12,
  },

  [`& .${classes.deleteButton}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}))

export function DeckTabs(props: {
  decks: DeckWithVersions[]
  onDeckUpdated: () => void
}): JSX.Element {
  const { decks } = props
  const confirm = useConfirm()
  const { enqueueSnackbar } = useSnackbar()
  const [currentDeckId, setCurrentDeckId] = useState<string | undefined>()
  const isSmOrBigger = useMediaQuery('(min-width:600px)')

  function chooseDeck(deckId: string) {
    if (deckId === currentDeckId) {
      setCurrentDeckId(undefined)
    } else {
      setCurrentDeckId(deckId)
    }
  }

  async function confirmDeletion(deckId: string) {
    const { confirmed } = await confirm({
      title: 'Delete Deck',
      description: 'Do you really want to delete this deck and all of its decklists?',
      confirmationText: 'Delete',
    })
    if (!confirmed) return
    privateApi.Deck.delete({ deckId: deckId })
      .then(() => {
        props.onDeckUpdated()
        setCurrentDeckId(undefined)
        enqueueSnackbar('The deck was deleted successfully!', { variant: 'success' })
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The deck couldn't be deleted!", { variant: 'error' })
      })
  }

  const sortedDecks = decks.sort(
    (a, b) =>
      new Date(latestDecklistForDeck(b)?.created_at || Date.now()).getTime() -
      new Date(latestDecklistForDeck(a)?.created_at || Date.now()).getTime()
  )

  return (
    <StyledGrid container spacing={1}>
      <Grid size={{ xs: 12, lg: 3, xl: 4 }}>
        <Grid container>
          <Grid size={12}>
            <EmeraldDBLink href={`/builder/create/new`}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                className={classes.newDeckButton}
              >
                Create New Deck
              </Button>
            </EmeraldDBLink>
          </Grid>
          {sortedDecks.map((deck) => {
            const latestList = latestDecklistForDeck(deck)
            return (
              <Grid key={deck.id} size={12}>
                <Box
                  padding={1}
                  borderRadius="3px"
                  border="1px solid"
                  hidden={!isSmOrBigger && currentDeckId !== undefined && deck.id !== currentDeckId}
                  className={
                    deck.id === currentDeckId ? classes.selectedDeck : classes.unselectedDeck
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={() => chooseDeck(deck.id)}
                >
                  <Grid container spacing={1} alignItems="center">
                    <Grid size={4}>
                      <Typography>{latestList?.name || 'Empty Deck'}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Tooltip
                        title={`Main: ${getFactionName(latestList?.primary_clan) || 'N/A'} / Splash: ${
                          getFactionName(latestList?.secondary_clan) || 'N/A'
                        }`}
                      >
                        <span>
                          {latestList?.primary_clan && (
                            <CardFactionIcon faction={latestList.primary_clan} colored />
                          )}
                          {latestList?.secondary_clan && (
                            <span>
                              {' / '}
                              <CardFactionIcon faction={latestList.secondary_clan} colored />
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid size={3}>
                      <Typography className={classes.format}>
                        {latestList?.stronghold?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography className={classes.format}>
                        {latestList?.role?.name || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, lg: 9, xl: 8 }}>
        <Grid container>
          {currentDeckId &&
            (() => {
              const currentDeck = sortedDecks.find((d) => d.id === currentDeckId)
              const latestDecklistId = latestDecklistForDeck(currentDeck!)?.id
              return (
                <Grid size={12}>
                  <Grid container spacing={1} justifyContent="flex-end">
                    <Grid size={4}>
                      <EmeraldDBLink href={`/builder/${currentDeckId}/edit`}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          className={classes.newDeckButton}
                          startIcon={<EditIcon />}
                        >
                          Edit Deck
                        </Button>
                      </EmeraldDBLink>
                    </Grid>
                    <Grid size={4}>
                      <EmeraldDBLink href={`/decks/${latestDecklistId}`}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          className={classes.newDeckButton}
                          startIcon={<LinkIcon />}
                          disabled={!latestDecklistId}
                        >
                          Link (Latest Version)
                        </Button>
                      </EmeraldDBLink>
                    </Grid>
                    <Grid size={4}>
                      <Button
                        variant="contained"
                        className={classes.deleteButton}
                        fullWidth
                        onClick={() => confirmDeletion(currentDeckId)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete This Deck
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              )
            })()}
          <Grid size={12}>
            {sortedDecks.map((deck) => (
              <DecklistTabs
                key={deck.id}
                deck={deck}
                currentDeckId={currentDeckId || ''}
                onDecklistUpdated={props.onDeckUpdated}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </StyledGrid>
  )
}
