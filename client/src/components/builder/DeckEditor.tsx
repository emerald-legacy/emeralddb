import {
  DecklistViewModel,
  Decklist as DecklistType,
  Deck,
  CardWithVersions,
  Format,
} from '@5rdb/api'
import { styled } from '@mui/material/styles'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
} from '@mui/material'
import { useState, type JSX } from 'react'
import { useUiStore } from '../../providers/UiStoreProvider'
import { BuilderCardList } from './BuilderCardList'
import { Decklist } from '../deck/Decklist'
import { privateApi } from '../../api'
import { DeckBuilderWizard } from './DeckBuilderWizard'
import Autocomplete from '@mui/material/Autocomplete'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router'
import { createDeckStatistics } from '../deck/DeckValidator'
import { Loading } from '../Loading'
import { VersionPicker } from './VersionPicker'
import { EmeraldDBLink } from '../EmeraldDBLink'
import { DeckStatistics } from './DeckStatistics'

const PREFIX = 'DeckEditor'

const classes = {
  unselectedList: `${PREFIX}-unselectedList`,
  selectedList: `${PREFIX}-selectedList`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.unselectedList}`]: {
    borderColor: 'lightgrey',
  },

  [`& .${classes.selectedList}`]: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
}))

function getEmptyDeckList(): DecklistViewModel {
  return {
    id: '',
    format: '',
    name: 'New Deck',
    primary_clan: undefined,
    secondary_clan: undefined,
    description: '',
    version_number: '0.1',
    cards: {},
  }
}

function getNextVersionNumber(versionNumber: string): string {
  const versionParts = versionNumber.split('.')
  if (versionParts.length < 2) {
    throw Error('Invalid Version number')
  }
  const minorVersion = Number.parseInt(versionParts[1])
  const nextMinorVersion = isNaN(minorVersion) ? 1 : minorVersion + 1
  versionParts[1] = nextMinorVersion.toString()
  return versionParts.join('.')
}

function prefilterCards(
  cards: CardWithVersions[],
  decklist: DecklistViewModel,
  formats: Format[],
  showIllegal: boolean = false
) {
  const stats = createDeckStatistics(decklist.cards, decklist.format, cards, formats)
  let filteredCards = decklist.primary_clan
    ? cards.filter((card) => card.allowed_clans?.includes(decklist.primary_clan || ''))
    : cards
  filteredCards = filteredCards.filter((c) => c.faction !== 'shadowlands')
  filteredCards = filteredCards.filter((c) => !c.text || !c.text.includes('Draft format only.'))
  if (decklist.format === 'skirmish') {
    filteredCards = filteredCards.filter(
      (c) =>
        c.type === 'character' ||
        c.type === 'event' ||
        c.type === 'attachment' ||
        c.type === 'holding'
    )
  }
  filteredCards = filteredCards.filter(
    (c) =>
      c.role_restrictions.length === 0 ||
      stats.role?.traits?.some((trait) => c.role_restrictions.includes(trait))
  )
  if (decklist.format === 'emerald') {
    filteredCards = filteredCards.filter(
      (c) =>
        !c.splash_banned_in || c.splash_banned_in.length === 0 || c.faction === stats.primaryClan
    )
  }
  filteredCards = filteredCards.filter((c) => !c.banned_in?.includes(decklist.format))

  if (!showIllegal) {
    const chosenFormat = formats.find((f) => f.id === decklist.format)
    if (chosenFormat && chosenFormat.legal_packs) {
      const legalPacksOfFormat = chosenFormat.legal_packs
      filteredCards = filteredCards.filter((c) =>
        c.versions.some(
          (version) => legalPacksOfFormat.includes(version.pack_id) && !version.rotated
        )
      )
    }
  }

  return filteredCards
}

enum ViewTypes {
  EDITOR,
  DESCRIPTION,
  STATISTICS,
}

export function DeckEditor(props: { existingDecklist?: DecklistType | undefined }): JSX.Element {
  const { cards, formats, relevantFormats, validCardVersionForFormat } = useUiStore()

  const [decklist, setDecklist] = useState(props.existingDecklist || getEmptyDeckList())
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [description, setDescription] = useState(props.existingDecklist?.description || '')
  const [newVersion, setNewVersion] = useState(decklist.version_number || '0.1')
  const [currentView, setCurrentView] = useState(ViewTypes.EDITOR)
  const [showAllCards, setShowAllCards] = useState(false)

  if (props.existingDecklist && decklist.version_number === props.existingDecklist.version_number) {
    const nextVersionNumber = getNextVersionNumber(props.existingDecklist.version_number)
    setDecklist({
      ...decklist,
      version_number: nextVersionNumber,
    })
    setNewVersion(nextVersionNumber)
  }
  if (!cards) {
    return <Loading />
  }

  const setWizardResult = (
    format: string,
    primaryClan: string,
    strongholdAndRole: Record<string, number>
  ) => {
    setDecklist({
      ...decklist,
      format: format,
      primary_clan: primaryClan,
      cards: strongholdAndRole,
    })
  }

  function setDeckListFromNewCards(newCards: Record<string, number>) {
    const stats = createDeckStatistics(newCards, decklist.format, cards, formats)
    setDecklist({
      ...decklist,
      cards: newCards,
      primary_clan: stats.primaryClan,
      secondary_clan: stats.secondaryClan,
    })
  }

  if (!props.existingDecklist && decklist.format === '') {
    return (
      <DeckBuilderWizard
        onComplete={setWizardResult}
        onImport={(decklist: DecklistViewModel) => {
          const stats = createDeckStatistics(decklist.cards, decklist.format, cards, formats)
          setDecklist({
            ...decklist,
            primary_clan: stats.primaryClan,
            secondary_clan: stats.secondaryClan,
          })
          setDescription(decklist.description || '')
        }}
      />
    )
  }

  const filteredCards = showAllCards ? cards : prefilterCards(cards, decklist, formats, true)

  function updateDeck(decklist: DecklistViewModel, deckId: string) {
    const { stronghold, role, ...decklistToSave } = decklist as any
    const cardPackIds: Record<string, string> = {}
    for (const cardId of Object.keys(decklist.cards)) {
      const version = validCardVersionForFormat(cardId, decklist.format)
      if (version) {
        cardPackIds[cardId] = version.pack_id
      }
    }
    privateApi.Decklist.create({
      body: {
        ...decklistToSave,
        deck_id: deckId,
        card_pack_ids: cardPackIds,
        published_date: undefined,
      },
    }).then(() => {
      setDecklist({ ...decklist, version_number: getNextVersionNumber(decklist.version_number) })
      navigate(`/builder/${deckId}/edit`)
      enqueueSnackbar('Successfully created deck', { variant: 'success' })
      setVersionModalOpen(false)
    })
  }

  function createOrUpdateDeck(decklist: DecklistViewModel) {
    if (props.existingDecklist) {
      updateDeck(decklist, props.existingDecklist.deck_id)
    } else {
      privateApi.Deck.create()
        .then((response) => {
          const newDeck = response.data() as Deck
          updateDeck(decklist, newDeck.id)
        })
        .catch((error) => {
          console.log(error)
          enqueueSnackbar('Error while creating deck: ' + error, { variant: 'error' })
        })
    }
  }

  function changeCardQuantity(cardId: string, quantity: number) {
    const selectedCards = decklist.cards
    if (quantity > 0) {
      selectedCards[cardId] = quantity
    } else {
      delete selectedCards[cardId]
    }
    setDecklist({ ...decklist, cards: selectedCards })
  }

  return (
    <Box sx={{ pb: 4 }}>
      <StyledGrid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <TextField
                value={decklist.name}
                fullWidth
                label="Deck Name"
                size="small"
                variant="outlined"
                onChange={(e) => setDecklist({ ...decklist, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, lg: 5 }}>
              <Autocomplete
                id="combo-box-format"
                autoHighlight
                options={[...relevantFormats].sort((a, b) => a.name.localeCompare(b.name))}
                getOptionLabel={(option) => option.name}
                value={relevantFormats.find((item) => item.id === decklist.format) || null}
                renderInput={(params) => (
                  <TextField {...params} label="Format" variant="outlined" size="small" />
                )}
                onChange={(e, value) => {
                  setDecklist({ ...decklist, format: value?.id || '' })
                }}
              />
            </Grid>
            <Grid size={{ xs: 3, lg: 3 }}>
              <TextField
                value={decklist.version_number}
                fullWidth
                disabled
                size="small"
                label="Version"
                variant="outlined"
                onChange={(e) => setDecklist({ ...decklist, version_number: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 3, lg: 4 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setVersionModalOpen(true)}
                fullWidth
              >
                Custom Version
              </Button>
            </Grid>
            <Grid size={12}>
              <Box border="1px solid" padding={3}>
                <Decklist decklist={decklist} withoutHeader onQuantityChange={changeCardQuantity} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}></Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper>
            <Grid container spacing={1}>
              <Grid size={6}>
                {props.existingDecklist && (
                  <EmeraldDBLink href={`/decks/${props.existingDecklist?.deck_id}/`}>
                    <Button variant="contained" fullWidth>
                      Link to Decklist
                    </Button>
                  </EmeraldDBLink>
                )}
              </Grid>
              <Grid size={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => createOrUpdateDeck(decklist)}
                  fullWidth
                >
                  Save Deck
                </Button>
              </Grid>
              <Grid size={12}>
                <Tabs
                  value={currentView}
                  onChange={(e, newValue) => setCurrentView(newValue)}
                  variant="fullWidth"
                >
                  <Tab
                    label="Editor"
                    value={ViewTypes.EDITOR}
                    className={
                      currentView === ViewTypes.EDITOR
                        ? classes.selectedList
                        : classes.unselectedList
                    }
                  />
                  <Tab
                    label="Description"
                    value={ViewTypes.DESCRIPTION}
                    className={
                      currentView === ViewTypes.DESCRIPTION
                        ? classes.selectedList
                        : classes.unselectedList
                    }
                  />
                  <Tab
                    label="Statistics"
                    value={ViewTypes.STATISTICS}
                    className={
                      currentView === ViewTypes.STATISTICS
                        ? classes.selectedList
                        : classes.unselectedList
                    }
                  />
                </Tabs>
                <Box hidden={currentView !== ViewTypes.EDITOR}>
                  {cards.length > 0 && (
                    <BuilderCardList
                      prefilteredCards={filteredCards}
                      selectedCards={decklist.cards}
                      onCardChange={(newCards: Record<string, number>) =>
                        setDeckListFromNewCards(newCards)
                      }
                      showAllCards={showAllCards}
                      setShowAllCards={setShowAllCards}
                      format={decklist.format}
                      primaryClan={decklist.primary_clan}
                    />
                  )}
                </Box>
                <Box hidden={currentView !== ViewTypes.DESCRIPTION} p={1}>
                  <TextField
                    value={description}
                    multiline
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => setDecklist({ ...decklist, description: description })}
                    label="Deck Description"
                  />
                </Box>
                <Box hidden={currentView !== ViewTypes.STATISTICS}>
                  <DeckStatistics
                    cards={decklist.cards}
                    allCards={cards}
                    format={decklist.format}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Dialog
          open={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          disableScrollLock
        >
          <DialogTitle>Specify Version</DialogTitle>
          <DialogContent>
            <VersionPicker
              version={newVersion}
              onVersionChange={(version) => setNewVersion(version)}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', pb: 3, pr: 3 }}>
            <Button
              onClick={() => setVersionModalOpen(false)}
              color="secondary"
              variant="contained"
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setDecklist({ ...decklist, version_number: newVersion })
                setVersionModalOpen(false)
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </StyledGrid>
    </Box>
  )
}
