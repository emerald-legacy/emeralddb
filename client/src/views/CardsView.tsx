import {
  Paper,
  useMediaQuery,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useNavigate, useLocation } from 'react-router'
import { useUiStore } from '../providers/UiStoreProvider'
import { convertTraitList } from '../utils/cardTextUtils'
import { capitalize } from '../utils/stringUtils'
import { useState, useEffect, useMemo, useCallback, type JSX } from 'react'
import { applyFilters, CardFilter, FilterState, initialState } from '../components/CardFilter'
import { CardWithVersions, Pack } from '@5rdb/api'
import { CardInformation } from '../components/card/CardInformation'
import { Loading } from '../components/Loading'
import { CardLink } from '../components/card/CardLink'
import { CardImageOrText } from '../components/card/CardImageOrText'
import { Pagination } from '@mui/material'

const PREFIX = 'CardsView'

const classes = {
  table: `${PREFIX}-table`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.table}`]: {
    marginTop: theme.spacing(1),
  },
}))

interface NameProps {
  id: string
  name: string
}

interface TableCard {
  id: string
  name: NameProps
  faction: string
  type: string
  traits: string
  deck: string
  cost: string
  military: string
  political: string
  glory: string
  strength: string
}

enum DisplayMode {
  LIST = 'list',
  IMAGES = 'images',
  FULL = 'full',
}

enum SortMode {
  NAME = 'name',
  PACK_POSITION = 'pack_position',
}

function createFilterFromUrlSearchParams(
  params: URLSearchParams,
  allPacks: Pack[],
  initialFilter: FilterState
): FilterState {
  const cycle = params.get('cycle')
  const pack = params.get('pack')
  const query = params.get('query') || ''
  const packs = cycle
    ? allPacks.filter((p) => p.cycle_id === cycle).map((p) => p.id)
    : pack
      ? [pack]
      : []

  return {
    ...initialFilter,
    text: decodeURIComponent(query) || initialFilter.text,
    packs: packs || initialFilter.packs,
    cycles: cycle ? [cycle] : initialFilter.cycles,
  }
}

export function CardsView(): JSX.Element {
  const PAGE_SIZE = 60

  const { cards, packs, cycles, traits, formats, validCardVersionForFormat } = useUiStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [filter, setFilter] = useState<FilterState | undefined>(undefined)
  const [modalCard, setModalCard] = useState<CardWithVersions | undefined>(undefined)
  const [urlParams, setUrlParams] = useState<string>('')
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST)
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.NAME)
  const [page, setPage] = useState(0)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const isMdOrBigger = useMediaQuery('(min-width:600px)')

  // Handle URL parameter changes in useEffect to prevent render-phase setState
  useEffect(() => {
    if (location.search !== urlParams) {
      const urlSearchParams = new URLSearchParams(location.search)
      const previousSearchParams = new URLSearchParams(urlParams)

      // Update filter if pack/cycle/query changed
      if (
        urlSearchParams.get('pack') != previousSearchParams.get('pack') ||
        urlSearchParams.get('cycle') != previousSearchParams.get('cycle') ||
        urlSearchParams.get('query') != previousSearchParams.get('query')
      ) {
        const urlParamFilter = createFilterFromUrlSearchParams(
          urlSearchParams,
          packs,
          filter || initialState
        )
        setFilter(urlParamFilter)

        const urlFilteredCards = applyFilters(cards, formats, urlParamFilter)
        if (urlFilteredCards.length === 1) {
          navigate(`/card/${urlFilteredCards[0].id}`)
        }
      }

      // Update display and sort mode from URL
      const displayParam = urlSearchParams.get('display')
      const sortParam = urlSearchParams.get('sort')

      if (displayParam) {
        setDisplayMode(displayParam as DisplayMode)
      }
      if (sortParam) {
        setSortMode(sortParam as SortMode)
      }

      setUrlParams(location.search)
    }
  }, [location.search, urlParams, packs, cards, formats, navigate])

  // Create urlSearchParams for use in render
  const urlSearchParams = new URLSearchParams(location.search)

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const filteredCards = useMemo(() => {
    if (filter) {
      return applyFilters(cards, formats, filter)
    }
    return cards
  }, [cards, formats, filter])

  const findCardVersion = useCallback(
    (card: CardWithVersions) => {
      const versionsWithFilteredPacks = filter?.packs
        ? card.versions.filter((v) => filter.packs.includes(v.pack_id))
        : card.versions

      const validFormatVersion = filter?.format && validCardVersionForFormat(card.id, filter.format)

      const candidateVersions = validFormatVersion
        ? [validFormatVersion]
        : versionsWithFilteredPacks.length > 0
          ? versionsWithFilteredPacks
          : card.versions

      if (filter?.text) {
        const query = filter.text.toLocaleLowerCase().trim()
        const artistMatch = candidateVersions.find((v) =>
          v.illustrator?.toLocaleLowerCase().includes(query)
        )
        if (artistMatch) {
          return artistMatch
        }
      }

      return candidateVersions[0]
    },
    [filter, validCardVersionForFormat]
  )

  const calculatePackIndex = useCallback(
    (card: CardWithVersions): { packIndex: string; cardIndex: string } => {
      const dummy = {
        packIndex: '9999',
        cardIndex: '999',
      }
      const cardVersion = findCardVersion(card)
      if (!cardVersion) {
        return dummy
      }
      const pack = packs.filter((pack) => pack.id === cardVersion.pack_id)[0]
      if (!pack) {
        return dummy
      }
      const cycle = cycles.filter((cycle) => cycle.id === pack.cycle_id)[0]
      const cyclePosition = (cycle?.position || 99) * 100
      const packPosition = pack.position
      let cardPosition = cardVersion.position || '999'
      while (cardPosition.length < 3) {
        cardPosition = '0' + cardPosition
      }
      return {
        packIndex: (cyclePosition + packPosition).toString(),
        cardIndex: cardPosition,
      }
    },
    [packs, cycles, findCardVersion]
  )

  const sortCardsByPackIndex = useCallback(
    (cardA: CardWithVersions, cardB: CardWithVersions) => {
      const aIndex = calculatePackIndex(cardA)
      const bIndex = calculatePackIndex(cardB)

      const indexCompare = aIndex.packIndex.localeCompare(bIndex.packIndex)
      return indexCompare === 0 ? aIndex.cardIndex.localeCompare(bIndex.cardIndex) : indexCompare
    },
    [calculatePackIndex]
  )

  const sortedCards = useMemo(() => {
    const sorted = [...filteredCards]
    if (sortMode === SortMode.NAME) {
      return sorted.sort((a, b) => a.id.localeCompare(b.id))
    } else {
      return sorted.sort(sortCardsByPackIndex)
    }
  }, [filteredCards, sortMode, sortCardsByPackIndex])

  const startIndexInclusive = page * PAGE_SIZE
  const endIndexExclusive = startIndexInclusive + PAGE_SIZE

  const currentCards = useMemo(
    () => sortedCards.slice(startIndexInclusive, endIndexExclusive),
    [sortedCards, startIndexInclusive, endIndexExclusive]
  )

  const handleCardClick = useCallback(
    (param: any, event: any) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        event.stopPropagation()
        return
      }
      setModalCard(cards.find((card) => card.id === param.row.id))
      setCardModalOpen(true)
    },
    [cards]
  )

  const handleImageClick = useCallback(
    (cardId: string) => {
      setModalCard(cards.find((card) => card.id === cardId))
      setCardModalOpen(true)
    },
    [cards]
  )

  // NOW we can do conditional returns after all hooks are called
  if (cards.length === 0) {
    return <Loading />
  }

  const goToCardPage = (id: string) => {
    navigate(`/card/${id}`)
  }

  function CardModal(): JSX.Element {
    if (!modalCard) {
      return <div />
    }
    return (
      <Dialog open={cardModalOpen} onClose={() => setCardModalOpen(false)} disableScrollLock>
        <DialogContent>
          <CardInformation
            cardWithVersions={modalCard}
            clickable
            currentVersion={findCardVersion(modalCard)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardModalOpen(false)} variant="contained">
            Close
          </Button>
          <Button onClick={() => goToCardPage(modalCard.id)} color="secondary" variant="contained">
            Go To Card Page
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  function Selectors(): JSX.Element {
    const sortOptions = [
      {
        option: SortMode.NAME,
        label: 'Sort by Name',
      },
      {
        option: SortMode.PACK_POSITION,
        label: 'Sort by Pack Position',
      },
    ]

    const displayOptions = [
      {
        option: DisplayMode.LIST,
        label: 'Table View',
      },
      {
        option: DisplayMode.IMAGES,
        label: 'Image View',
      },
      {
        option: DisplayMode.FULL,
        label: 'Text + Image View',
      },
    ]

    const pageCount = Math.ceil(filteredCards.length / PAGE_SIZE)

    return (
      <Box paddingBottom={2}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Select
              value={displayMode}
              label="Display Mode"
              onChange={(event) => {
                const newMode = (event.target.value as DisplayMode) || DisplayMode.LIST
                setDisplayMode(newMode)
                urlSearchParams.set('display', newMode)
                navigate({
                  pathname: '/cards',
                  search: urlSearchParams.toString(),
                })
              }}
              variant={'outlined'}
              size="small"
              fullWidth
            >
              {displayOptions.map((option) => (
                <MenuItem key={option.option} value={option.option}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid hidden={displayMode === DisplayMode.LIST} size={{ xs: 6, sm: 3 }}>
            <Select
              value={sortMode}
              label="Sort Mode"
              onChange={(event) => {
                const newMode = (event.target.value as SortMode) || SortMode.NAME
                setSortMode(newMode)
                urlSearchParams.set('sort', newMode)
                navigate({
                  pathname: '/cards',
                  search: urlSearchParams.toString(),
                })
              }}
              variant={'outlined'}
              size="small"
              fullWidth
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.option} value={option.option}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid hidden={displayMode === DisplayMode.LIST} size={{ xs: 12, sm: 6 }}>
            <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pagination
                count={pageCount}
                page={page + 1}
                onChange={(e, value) => setPage(value - 1)}
                color={'secondary'}
                shape={'rounded'}
                size={'large'}
                style={{ padding: '7px 0' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const onFilterChanged = (newFilter: FilterState) => {
    setFilter(newFilter)
    setPage(0)
  }

  if (displayMode === DisplayMode.LIST) {
    const tableCards: TableCard[] = filteredCards.map((card) => {
      const mil =
        card.military !== null && card.military !== undefined
          ? card.military
          : card.military_bonus !== null && card.military_bonus !== undefined
            ? card.military_bonus
            : card.type === 'character' || card.type === 'attachment'
              ? '-'
              : ''
      const pol =
        card.political !== null && card.political !== undefined
          ? card.political
          : card.political_bonus !== null && card.political_bonus !== undefined
            ? card.political_bonus
            : card.type === 'character' || card.type === 'attachment'
              ? '-'
              : ''

      return {
        id: card.id,
        name: { id: card.id, name: card.name },
        faction: capitalize(card.faction),
        type: capitalize(card.type),
        traits: convertTraitList(card.traits || [], traits),
        deck: capitalize(card.side),
        cost: card.cost || '',
        military: mil,
        political: pol,
        glory: card.glory !== null ? '' + card.glory : '',
        strength: card.strength || card.strength_bonus || '',
      }
    })

    const columns: GridColDef[] = [
      {
        field: 'name',
        headerName: 'Name',
        flex: isMdOrBigger ? 5 : 10,
        disableColumnMenu: true,
        renderCell: (params) => {
          const nameProps = params.value as NameProps
          return (
            <div>
              <CardLink
                cardId={nameProps.id}
                sameTab
                format={filter?.format}
                hoveredCardId={hoveredCardId}
                onHover={setHoveredCardId}
              />
            </div>
          )
        },
        sortComparator: (v1, v2) => (v1 as NameProps).name.localeCompare((v2 as NameProps).name),
      },
      {
        field: 'traits',
        headerName: 'Traits',
        disableColumnMenu: true,
        flex: isMdOrBigger ? 3 : 5,
        renderCell: (params) => (
          <em>
            <b>{params.value}</b>
          </em>
        ),
      },
      { field: 'type', headerName: 'Type', disableColumnMenu: true, flex: 2 },
      {
        field: 'faction',
        headerName: 'Faction',
        disableColumnMenu: true,
        flex: 2,
      },
      { field: 'deck', headerName: 'Deck', disableColumnMenu: true, flex: 1 },
      { field: 'cost', headerName: 'Cost', disableColumnMenu: true, flex: 1 },
      {
        field: 'military',
        headerName: 'Mil',
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: 'political',
        headerName: 'Pol',
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: 'glory',
        headerName: 'Glory',
        disableColumnMenu: true,
        flex: 1,
      },
      {
        field: 'strength',
        headerName: 'Str',
        disableColumnMenu: true,
        flex: 1,
      },
    ]

    return (
      <Box sx={{ pb: 4, maxWidth: 1400, mx: 'auto', px: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <CardFilter
              onFilterChanged={onFilterChanged}
              fullWidth
              filterState={filter || initialState}
            />
          </Grid>
          <Grid size={12}>
            <Card>
              <CardContent>
                <Selectors />
                <div onMouseLeave={() => setHoveredCardId(null)}>
                  <DataGrid
                    disableRowSelectionOnClick
                    columns={columns}
                    rows={tableCards}
                    pageSizeOptions={[50]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 50 } },
                    }}
                    autoHeight
                    density="compact"
                    columnVisibilityModel={{
                      type: isMdOrBigger,
                      faction: isMdOrBigger,
                      deck: isMdOrBigger,
                      cost: isMdOrBigger,
                      military: isMdOrBigger,
                      political: isMdOrBigger,
                      glory: isMdOrBigger,
                      strength: isMdOrBigger,
                    }}
                    onRowClick={handleCardClick}
                    sx={{
                      '& .MuiTablePagination-displayedRows': {
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiTablePagination-toolbar': {
                        alignItems: 'center',
                      },
                      '& .MuiTablePagination-spacer': {
                        flex: '1 1 100%',
                      },
                      '& .MuiDataGrid-footerContainer': {
                        justifyContent: 'flex-end',
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <CardModal />
      </Box>
    )
  }

  if (displayMode === DisplayMode.IMAGES) {
    return (
      <Box sx={{ pb: 4, maxWidth: 1400, mx: 'auto', px: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <CardFilter
              onFilterChanged={onFilterChanged}
              fullWidth
              filterState={filter || initialState}
            />
          </Grid>
          <Grid size={12}>
            <Card>
              <CardContent>
                <Selectors />
                <Box>
                  <Grid container spacing={1}>
                    {currentCards.map((card) => (
                      <Grid key={card.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                        <Box margin={'0 auto'}>
                          <CardImageOrText
                            cardId={card.id}
                            onClick={handleImageClick}
                            cardVersion={findCardVersion(card)}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ pt: 2 }}>
                  <Selectors />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <CardModal />
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 4, maxWidth: 1400, mx: 'auto', px: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CardFilter
            onFilterChanged={onFilterChanged}
            fullWidth
            filterState={filter || initialState}
          />
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Selectors />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent>
              {currentCards.map((card, index) => (
                <Box key={card.id}>
                  {index > 0 && <Divider sx={{ my: 3 }} />}
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CardInformation
                        cardWithVersions={card}
                        clickable
                        currentVersion={findCardVersion(card)}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          onClick={() => goToCardPage(card.id)}
                          color="secondary"
                          variant="contained"
                        >
                          Go To Card Page
                        </Button>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box maxWidth={'300px'} margin={'0 auto'}>
                        <CardImageOrText
                          cardId={card.id}
                          onClick={handleImageClick}
                          cardVersion={findCardVersion(card)}
                          showFab={false}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Selectors />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CardModal />
    </Box>
  )
}
