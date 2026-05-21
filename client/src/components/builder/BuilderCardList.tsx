import { CardWithVersions } from '@5rdb/api'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  useMediaQuery,
} from '@mui/material'
import min from 'lodash/min'
import { useState, useMemo, type JSX } from 'react'
import { useUiStore } from '../../providers/UiStoreProvider'
import { convertTraitList } from '../../utils/cardTextUtils'
import { applyFilters, CardFilter, FilterState } from '../CardFilter'
import { ColumnData, TableCardData, VirtualizedCardTable } from './VirtualizedCardTable'
import Autocomplete from '@mui/material/Autocomplete'
import { CardQuantitySelector } from './CardQuantitySelector'
import { CardImageOrText } from '../card/CardImageOrText'
import { CardInformation } from '../card/CardInformation'

function initialFilter(primaryClan: string | undefined, format: string): FilterState {
  const sides = ['dynasty', 'conflict']
  const types = ['character', 'event', 'holding', 'attachment']
  if (format !== 'skirmish') {
    sides.push('province')
    types.push('province')
  }

  return {
    cardTypes: types,
    factions: primaryClan ? [primaryClan, 'neutral'] : [],
    packs: [],
    sides: sides,
    text: '',
    traits: [],
    action: '',
    keyword: '',
    elements: [],
    roleRestrictions: [],
    cycles: [],
    numericValues: [],
    format: format,
    restricted: 'true',
    banned: 'false',
    illegal: 'false',
    isUnique: '',
  }
}

enum SortMode {
  COST = 'cost',
  NAME = 'name',
  MIL = 'mil',
  POL = 'pol',
  GLORY = 'glory',
  STR = 'str',
}

enum DisplayMode {
  LIST = 'list',
  IMAGES = 'images',
}

const sortModeNames = [
  { mode: SortMode.NAME, name: 'Name' },
  { mode: SortMode.COST, name: 'Cost' },
  { mode: SortMode.MIL, name: 'Military (Bonus)' },
  { mode: SortMode.POL, name: 'Political (Bonus)' },
  { mode: SortMode.GLORY, name: 'Glory' },
  { mode: SortMode.STR, name: 'Strength (Bonus)' },
]

const displayModeNames = [
  { mode: DisplayMode.LIST, name: 'Card List' },
  { mode: DisplayMode.IMAGES, name: 'Card Images' },
]

export function BuilderCardList(props: {
  prefilteredCards: CardWithVersions[]
  selectedCards: Record<string, number>
  onCardChange: (newCards: Record<string, number>) => void
  showAllCards: boolean
  setShowAllCards: (show: boolean) => void
  format: string
  primaryClan: string | undefined
}): JSX.Element {
  const { traits, relevantFormats, validCardVersionForFormat, cards } = useUiStore()
  const [filter, setFilter] = useState<FilterState | undefined>(
    initialFilter(props.primaryClan, props.format)
  )
  const [selectedCards] = useState<Record<string, number>>(props.selectedCards)
  const isSmOrSmaller = useMediaQuery('(max-width:600px)')
  const [showTraits, setShowTraits] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.COST)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST)
  const [order, setOrder] = useState<'Ascending' | 'Descending'>('Ascending')
  const [modalCard, setModalCard] = useState<CardWithVersions | undefined>(undefined)
  const [cardModalOpen, setCardModalOpen] = useState(false)

  const defaultDeckLimit = props.format === 'skirmish' || props.format === 'obsidian' ? 2 : 3

  const filteredAndSortedCards = useMemo(() => {
    let filtered = props.prefilteredCards
    if (filter) {
      filtered = applyFilters(props.prefilteredCards, relevantFormats, filter)
    }
    return sortCards(filtered)
  }, [props.prefilteredCards, relevantFormats, filter, sortMode, order])

  function changeCardQuantity(cardId: string, quantity: number) {
    if (quantity > 0) {
      selectedCards[cardId] = quantity
    } else {
      delete selectedCards[cardId]
    }
    props.onCardChange(selectedCards)
  }

  function sortCards(cards: CardWithVersions[]): CardWithVersions[] {
    return cards.sort((cardA, cardB) => {
      let criteriumA = ''
      let criteriumB = ''
      switch (sortMode) {
        case SortMode.COST: {
          criteriumA = cardA.cost || ''
          criteriumB = cardB.cost || ''
          break
        }
        case SortMode.NAME: {
          criteriumA = cardA.name
          criteriumB = cardB.name
          break
        }
        case SortMode.MIL: {
          criteriumA = cardA.military || cardA.military_bonus || ''
          criteriumB = cardB.military || cardB.military_bonus || ''
          break
        }
        case SortMode.POL: {
          criteriumA = cardA.political || cardA.political_bonus || ''
          criteriumB = cardB.political || cardB.political_bonus || ''
          break
        }
        case SortMode.GLORY: {
          criteriumA = cardA.glory?.toString() || ''
          criteriumB = cardB.glory?.toString() || ''
          break
        }
        case SortMode.STR: {
          criteriumA = cardA.strength || cardA.strength_bonus || ''
          criteriumB = cardB.strength || cardB.strength_bonus || ''
          break
        }
      }
      if (order === 'Ascending') {
        criteriumA = criteriumA || 'ZZZ'
        criteriumB = criteriumB || 'ZZZ'
        return criteriumA.localeCompare(criteriumB)
      } else {
        return criteriumB.localeCompare(criteriumA)
      }
    })
  }

  const handleImageClick = (cardId: string) => {
    setModalCard(cards.find((card) => card.id === cardId))
    setCardModalOpen(true)
  }

  function CardModal(): JSX.Element {
    if (!modalCard) {
      return <div />
    }
    const cardVersion = validCardVersionForFormat(modalCard.id, props.format)
    return (
      <Dialog open={cardModalOpen} onClose={() => setCardModalOpen(false)} disableScrollLock>
        <DialogContent>
          <CardInformation cardWithVersions={modalCard} clickable currentVersion={cardVersion} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardModalOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const tableData: TableCardData[] = filteredAndSortedCards.map((card) => {
    return {
      quantityForId: {
        quantity: selectedCards[card.id] || 0,
        deckLimit: min([card.deck_limit, defaultDeckLimit]) || defaultDeckLimit,
        onQuantityChange: (newQuantity: number) => changeCardQuantity(card.id, newQuantity),
      },
      nameFactionType: {
        name: card.name,
        faction: card.faction,
        type: card.type,
        cardId: card.id,
        format: props.format,
      },
      traits: {
        traits: convertTraitList(card.traits || [], traits),
      },
      influenceAndFaction: {
        influence: card.influence_cost || -1,
        faction: card.faction,
      },
      cost: {
        cost: card.cost || '',
      },
      mil: {
        mil:
          card.military !== null && card.military !== undefined
            ? card.military
            : card.military_bonus !== null && card.military_bonus !== undefined
              ? card.military_bonus
              : card.type === 'character' || card.type === 'attachment'
                ? '-'
                : '',
      },
      pol: {
        pol:
          card.political !== null && card.political !== undefined
            ? card.political
            : card.political_bonus !== null && card.political_bonus !== undefined
              ? card.political_bonus
              : card.type === 'character' || card.type === 'attachment'
                ? '-'
                : '',
      },
      glory: {
        glory: card.glory?.toString() || '',
      },
      strength: {
        strength: card.strength || card.strength_bonus || '',
      },
    }
  })

  function updateFilter(filterState: FilterState) {
    setFilter(filterState)
  }

  const columns: ColumnData[] = [
    {
      width: 90,
      label: 'Quantity',
      columnType: 'quantityForId',
    },
    {
      width: 240,
      label: 'Card',
      columnType: 'nameFactionType',
    },
    {
      width: 30,
      label: '',
      columnType: 'influenceAndFaction',
    },
    {
      width: 50,
      label: 'Cost',
      columnType: 'cost',
    },
  ]

  if (!isSmOrSmaller && showTraits) {
    columns.push({
      width: 0,
      label: 'Traits',
      columnType: 'traits',
    })
  }
  if (!isSmOrSmaller && !showTraits) {
    columns.push(
      {
        width: 70,
        label: 'M',
        columnType: 'mil',
      },
      {
        width: 70,
        label: 'P',
        columnType: 'pol',
      },
      {
        width: 70,
        label: 'G',
        columnType: 'glory',
      },
      {
        width: 70,
        label: 'S',
        columnType: 'strength',
      }
    )
  }

  return (
    <>
      {showFilters && (
        <CardFilter
          onFilterChanged={(filter) => updateFilter(filter)}
          filterState={filter}
          deckbuilder
        />
      )}
      <Paper style={{ padding: '10px 16px', marginTop: showFilters ? 8 : 0 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              id="combo-box-displayMode"
              autoHighlight
              options={displayModeNames}
              getOptionLabel={(option) => option.name}
              value={
                displayModeNames.find((modeName) => modeName.mode === displayMode) || {
                  mode: DisplayMode.LIST,
                  name: 'Card List',
                }
              }
              renderInput={(params) => (
                <TextField {...params} size="small" label="Display Mode" variant="outlined" />
              )}
              onChange={(e, value) => setDisplayMode(value?.mode || DisplayMode.LIST)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {showFilters ? (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => setShowFilters(false)}
              >
                Hide Filters
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => setShowFilters(true)}
              >
                Show Filters
              </Button>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.showAllCards}
                  onChange={(e) => props.setShowAllCards(e.target.checked)}
                  name="checkedA"
                />
              }
              label="Show Illegal Cards"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              id="combo-box-sortMode"
              autoHighlight
              options={sortModeNames}
              getOptionLabel={(option) => option.name}
              value={
                sortModeNames.find((modeName) => modeName.mode === sortMode) || {
                  mode: SortMode.COST,
                  name: 'Cost',
                }
              }
              renderInput={(params) => (
                <TextField {...params} size="small" label="Sort By" variant="outlined" />
              )}
              onChange={(e, value) => setSortMode(value?.mode || SortMode.NAME)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              id="combo-box-sortOrder"
              options={['Ascending', 'Descending']}
              getOptionLabel={(option) => option}
              value={order}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Sort Order" variant="outlined" />
              )}
              onChange={(e, value) => setOrder(value === 'Descending' ? 'Descending' : 'Ascending')}
            />
          </Grid>
          {!isSmOrSmaller && displayMode === DisplayMode.LIST && (
            <Grid size={{ xs: 12, md: 4 }}>
              {showTraits ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setShowTraits(false)}
                >
                  Show Stats
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setShowTraits(true)}
                >
                  Show Traits
                </Button>
              )}
            </Grid>
          )}
          <Grid style={{ height: 830 }} size={12}>
            {displayMode === DisplayMode.LIST && (
              <VirtualizedCardTable
                rowCount={filteredAndSortedCards.length}
                rowGetter={({ index }) => tableData[index]}
                columns={columns}
              />
            )}
            {displayMode === DisplayMode.IMAGES && (
              <VirtualizedCardImages
                tableData={tableData}
                isSmOrSmaller={isSmOrSmaller}
                format={props.format}
                validCardVersionForFormat={validCardVersionForFormat}
                onCardClick={handleImageClick}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
      <CardModal />
    </>
  )
}

function VirtualizedCardImages(props: {
  tableData: TableCardData[]
  isSmOrSmaller: boolean
  format: string
  validCardVersionForFormat: (cardId: string, formatId: string) => any
  onCardClick: (cardId: string) => void
}): JSX.Element {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', mt: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1,
          padding: 1,
        }}
      >
        {props.tableData.map((card) => (
          <Box
            key={card.nameFactionType.cardId}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CardImageOrText
              cardId={card.nameFactionType.cardId}
              cardVersion={props.validCardVersionForFormat(
                card.nameFactionType.cardId,
                props.format
              )}
              onClick={props.onCardClick}
            />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '5px',
                marginBottom: '5px',
              }}
            >
              <CardQuantitySelector
                deckLimit={card.quantityForId.deckLimit}
                quantity={card.quantityForId.quantity}
                onQuantityChange={card.quantityForId.onQuantityChange}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
