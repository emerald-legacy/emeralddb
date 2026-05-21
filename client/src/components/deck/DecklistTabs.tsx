import { DeckWithVersions, DecklistWithExtraInfo } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import { Box, Button, Grid, Tab, Tabs, Typography } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import { useState, type JSX } from 'react'
import { privateApi } from '../../api'
import { Decklist } from './Decklist'
import DeleteIcon from '@mui/icons-material/Delete'
import LinkIcon from '@mui/icons-material/Link'
import ShareIcon from '@mui/icons-material/Share'
import BlockIcon from '@mui/icons-material/Block'
import { EmeraldDBLink } from '../EmeraldDBLink'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UiStoreQueries } from '../../providers/UiStoreProvider'

const PREFIX = 'DecklistTabs'

const classes = {
  newDeckButton: `${PREFIX}-newDeckButton`,
  unselectedList: `${PREFIX}-unselectedList`,
  selectedList: `${PREFIX}-selectedList`,
  deleteButton: `${PREFIX}-deleteButton`,
}

interface TabPanelProps {
  children?: React.ReactNode
  index: string
  value: string
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
  [`& .${classes.newDeckButton}`]: {
    marginBottom: 3,
  },

  [`& .${classes.unselectedList}`]: {
    borderColor: 'lightgrey',
  },

  [`& .${classes.selectedList}`]: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },

  [`& .${classes.deleteButton}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}))

export function sortedVersionsForDeck(deck: DeckWithVersions): DecklistWithExtraInfo[] {
  return deck.versions.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function latestDecklistForDeck(deck: DeckWithVersions): DecklistWithExtraInfo | undefined {
  return sortedVersionsForDeck(deck)[0]
}

export function DecklistTabs(props: {
  deck: DeckWithVersions
  currentDeckId: string
  onDecklistUpdated: () => void
}): JSX.Element {
  const { deck, currentDeckId } = props
  const [currentDecklistId, setCurrentDecklistId] = useState(
    latestDecklistForDeck(deck)?.id || undefined
  )

  const confirm = useConfirm()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const publishMutation = useMutation({
    mutationFn: (decklistId: string) => privateApi.Decklist.publish({ decklistId }),
    onSuccess: () => {
      props.onDecklistUpdated()
      enqueueSnackbar('The decklist was published successfully!', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: UiStoreQueries.PUBLISHED_DECKLISTS })
    },
    onError: (error: any) => {
      const message = error.data()
      enqueueSnackbar(`The decklist couldn't be published: ${message}!`, { variant: 'error' })
    },
  })

  const versions = sortedVersionsForDeck(deck)

  if (versions.length < 1) {
    return (
      <Typography hidden={deck.id !== currentDeckId}>
        There are no versions of this deck.
      </Typography>
    )
  }

  async function confirmDeletion(decklistId: string) {
    const { confirmed } = await confirm({
      title: 'Delete Version',
      description: 'Do you really want to delete this version of the deck?',
      confirmationText: 'Delete',
    })
    if (!confirmed) return
    privateApi.Decklist.delete({ decklistId: decklistId })
      .then(() => {
        props.onDecklistUpdated()
        setCurrentDecklistId(latestDecklistForDeck(deck)?.id || undefined)
        enqueueSnackbar('The decklist was deleted successfully!', { variant: 'success' })
        queryClient.invalidateQueries({ queryKey: UiStoreQueries.PUBLISHED_DECKLISTS })
      })
      .catch((error) => {
        const message = error.data()
        enqueueSnackbar(`The decklist couldn't be deleted: ${message}!`, { variant: 'error' })
      })
  }

  async function publishDecklist(decklistId: string) {
    const { confirmed } = await confirm({
      title: 'Publish Decklist',
      description: 'Do you really want to publish this version of the deck?',
      confirmationText: 'Publish',
    })
    if (!confirmed) return
    publishMutation.mutate(decklistId)
  }

  async function unpublishDecklist(decklistId: string) {
    const { confirmed } = await confirm({
      title: 'Unpublish Version',
      description: 'Do you really want to unpublish this version of the deck?',
      confirmationText: 'Unpublish',
    })
    if (!confirmed) return
    privateApi.Decklist.unpublish({ decklistId: decklistId })
      .then(() => {
        props.onDecklistUpdated()
        enqueueSnackbar('The decklist was unpublished successfully!', { variant: 'success' })
        queryClient.invalidateQueries({ queryKey: UiStoreQueries.PUBLISHED_DECKLISTS })
      })
      .catch((error) => {
        const message = error.data()
        enqueueSnackbar(`The decklist couldn't be unpublished: ${message}!`, {
          variant: 'error',
        })
      })
  }

  return (
    <StyledTabPanel value={currentDeckId} index={deck.id}>
      <Grid container>
        <Grid size={12}>
          <Tabs
            value={versions.findIndex((list) => list.id === currentDecklistId) || 0}
            onChange={(e, newValue) =>
              setCurrentDecklistId(versions[newValue]?.id || versions[0].id)
            }
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {versions.map((v) => (
              <Tab
                key={v.id}
                label={
                  <Typography>
                    {v.published_date && <ShareIcon />}
                    {v.version_number}
                  </Typography>
                }
                className={
                  currentDecklistId === v.id ? classes.selectedList : classes.unselectedList
                }
              />
            ))}
          </Tabs>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            <Grid size={12}>
              {versions.map((v) => (
                <div hidden={v.id !== currentDecklistId} key={v.id}>
                  <Box border="1px solid" borderBottom="0" bgcolor="lightgray" p={2}>
                    <Grid container spacing={1} justifyContent="flex-end">
                      <Grid size={{ xs: 6, md: 4 }}>
                        <EmeraldDBLink href={`/decks/${v.id}`}>
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            size="small"
                            startIcon={<LinkIcon />}
                          >
                            Link (This Version)
                          </Button>
                        </EmeraldDBLink>
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        {!v.published_date ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => publishDecklist(v.id)}
                            fullWidth
                            size="small"
                            startIcon={<ShareIcon />}
                          >
                            Publish This Version
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => unpublishDecklist(v.id)}
                            fullWidth
                            size="small"
                            startIcon={<BlockIcon />}
                          >
                            Unpublish this Version
                          </Button>
                        )}
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <Button
                          variant="contained"
                          className={classes.deleteButton}
                          onClick={() => confirmDeletion(v.id)}
                          fullWidth
                          size="small"
                          startIcon={<DeleteIcon />}
                        >
                          Delete This Version
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box border="1px solid" p={2}>
                    <Decklist decklist={v} />
                  </Box>
                </div>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledTabPanel>
  )
}
