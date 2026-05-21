import { useEffect, useReducer, useState, type JSX } from 'react'
import { styled } from '@mui/material/styles'
import { CardWithVersions, Trait, RoleRestriction, Format } from '@5rdb/api'
import {
  Button,
  ButtonGroup,
  lighten,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Collapse,
} from '@mui/material'
import { factions, cardTypes, sides, elements, roleRestrictions } from '../utils/enums'
import { CardTypeIcon } from './card/CardTypeIcon'
import Autocomplete from '@mui/material/Autocomplete'
import { useUiStore } from '../providers/UiStoreProvider'
import { CycleList } from './CycleList'
import useDebounce from '../hooks/useDebounce'
import { isEqual } from 'lodash'
import { CardValueFilter, ValueFilterType } from './CardValueFilter'
import { ElementSymbol } from './card/ElementSymbol'

const PREFIX = 'CardFilter'

const classes = {
  filter: `${PREFIX}-filter`,
  clearIcon: `${PREFIX}-clearIcon`,
  clearButton: `${PREFIX}-clearButton`,
  button: `${PREFIX}-button`,
  buttonGroup: `${PREFIX}-buttonGroup`,
  filterGridItem: `${PREFIX}-filterGridItem`,
  filterGridItemBuilder: `${PREFIX}-filterGridItemBuilder`,
  traitTextField: `${PREFIX}-traitTextField`,
  packDialog: `${PREFIX}-packDialog`,
  packFilter: `${PREFIX}-packFilter`,
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.filter}`]: {
    padding: theme.spacing(1),
  },

  [`& .${classes.clearIcon}`]: {
    color: 'black',
    fontSize: 16,
  },

  [`& .${classes.clearButton}`]: {
    backgroundColor: theme.palette.error.light,
    '&:hover': {
      backgroundColor: lighten(theme.palette.error.light, 0.1),
    },
  },

  [`& .${classes.button}`]: {
    minHeight: 40,
    minWidth: 16,
  },

  [`& .${classes.buttonGroup}`]: {
    height: '100%',
  },

  [`& .${classes.filterGridItem}`]: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'stretch',
  },

  [`& .${classes.filterGridItemBuilder}`]: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'stretch',
  },

  [`& .${classes.traitTextField}`]: {
    maxHeight: 40,
  },

  [`& .${classes.packDialog}`]: {
    padding: theme.spacing(1),
  },

  [`& .${classes.packFilter}`]: {
    minWidth: '60%',
  },
}))

enum NumericCardValue {
  COST,
  MILITARY,
  POLITICAL,
  STRENGTH,
  GLORY,
  INFLUENCE,
}

interface NumericFilterTypeAndValue {
  type: ValueFilterType
  value: string
}

interface NumericValueFilter {
  name: NumericCardValue
  typeAndValue: NumericFilterTypeAndValue
}

export interface FilterState {
  text: string
  factions: string[]
  cardTypes: string[]
  sides: string[]
  traits: string[]
  action: string
  keyword: string
  elements: string[]
  roleRestrictions: string[]
  packs: string[]
  cycles: string[]
  isUnique: string
  numericValues: NumericValueFilter[]
  format: string
  restricted: 'true' | 'false' | 'only'
  banned: 'true' | 'false' | 'only'
  illegal: 'true' | 'false'
}

enum FilterType {
  FILTER_ALL,
  FILTER_TEXT,
  FILTER_FACTIONS,
  FILTER_CARD_TYPES,
  FILTER_SIDES,
  FILTER_TRAITS,
  FILTER_ACTION,
  FILTER_KEYWORD,
  FILTER_ELEMENTS,
  FILTER_ROLE_RESTRICTIONS,
  FILTER_PACKS,
  FILTER_CYCLES,
  FILTER_PACKS_AND_CYCLES,
  FILTER_IS_UNIQUE,
  FILTER_FORMAT,
  FILTER_RESTRICTED,
  FILTER_BANNED,
  FILTER_NUMERIC_VALUES,
  FILTER_ILLEGAL,
  FILTER_RESET,
}

type FilterAction =
  | { type: FilterType.FILTER_ALL; filter: FilterState }
  | { type: FilterType.FILTER_TEXT; text: string }
  | { type: FilterType.FILTER_FACTIONS; factions: string[] }
  | { type: FilterType.FILTER_CARD_TYPES; cardTypes: string[] }
  | { type: FilterType.FILTER_SIDES; sides: string[] }
  | { type: FilterType.FILTER_TRAITS; traits: string[] }
  | { type: FilterType.FILTER_ACTION; action: string }
  | { type: FilterType.FILTER_KEYWORD; keyword: string }
  | { type: FilterType.FILTER_ELEMENTS; elements: string[] }
  | { type: FilterType.FILTER_ROLE_RESTRICTIONS; restrictions: string[] }
  | { type: FilterType.FILTER_PACKS; packs: string[] }
  | { type: FilterType.FILTER_CYCLES; cycles: string[] }
  | { type: FilterType.FILTER_PACKS_AND_CYCLES; packs: string[]; cycles: string[] }
  | { type: FilterType.FILTER_IS_UNIQUE; isUnique: string }
  | { type: FilterType.FILTER_FORMAT; format: string }
  | { type: FilterType.FILTER_RESTRICTED; showRestricted: 'true' | 'false' | 'only' }
  | { type: FilterType.FILTER_BANNED; showBanned: 'true' | 'false' | 'only' }
  | { type: FilterType.FILTER_ILLEGAL; showIllegal: 'true' | 'false' }
  | { type: FilterType.FILTER_NUMERIC_VALUES; numericValues: NumericValueFilter[] }
  | { type: FilterType.FILTER_RESET }

function checkSingleValue(value: string | undefined, filter: NumericFilterTypeAndValue): boolean {
  if (!value) {
    return false
  }
  switch (filter.type) {
    case ValueFilterType.EQUAL: {
      return value === filter.value
    }
    case ValueFilterType.GREATER: {
      const inputNumber = Number.parseInt(value)
      const filterNumber = Number.parseInt(filter.value)
      if (isNaN(inputNumber) || isNaN(filterNumber)) {
        return false
      }
      return inputNumber > filterNumber
    }
    case ValueFilterType.LOWER: {
      const inputNumber = Number.parseInt(value)
      const filterNumber = Number.parseInt(filter.value)
      if (isNaN(inputNumber) || isNaN(filterNumber)) {
        return false
      }
      return inputNumber < filterNumber
    }
  }
}

function checkMultipleValues(
  values: (string | undefined)[],
  filter: NumericFilterTypeAndValue
): boolean {
  return values?.some((value) => checkSingleValue(value, filter))
}

function filterNumericCardValues(card: CardWithVersions, filters: NumericValueFilter[]): boolean {
  return filters.every((filter) => {
    if (filter.typeAndValue === undefined) {
      return true
    } else {
      switch (filter.name) {
        case NumericCardValue.COST:
          return checkSingleValue(card.cost, filter.typeAndValue)
        case NumericCardValue.INFLUENCE:
          return checkSingleValue('' + card.influence_cost, filter.typeAndValue)
        case NumericCardValue.MILITARY: {
          let military = card.military
          if (card.type === 'character' && !military) {
            military = '-'
          }
          return checkMultipleValues([military, card.military_bonus], filter.typeAndValue)
        }
        case NumericCardValue.POLITICAL: {
          let political = card.political
          if (card.type === 'character' && !political) {
            political = '-'
          }
          return checkMultipleValues([political, card.political_bonus], filter.typeAndValue)
        }
        case NumericCardValue.GLORY:
          return checkSingleValue('' + card.glory, filter.typeAndValue)
        case NumericCardValue.STRENGTH:
          return checkMultipleValues([card.strength, card.strength_bonus], filter.typeAndValue)
      }
    }
    // Needed for eslint /shrug
    return true
  })
}

function replaceSpecialCharacters(text: string): string {
  return text
    .toLocaleLowerCase()
    .trim()
    .replaceAll('ā', 'a')
    .replaceAll('ō', 'o')
    .replaceAll('ū', 'u')
    .replaceAll('é', 'e')
    .replaceAll('è', 'e')
    .replaceAll('ê', 'e')
    .replaceAll('ë', 'e')
    .replaceAll('á', 'a')
    .replaceAll('à', 'a')
    .replaceAll('â', 'a')
    .replaceAll('ä', 'a')
    .replaceAll('í', 'i')
    .replaceAll('ì', 'i')
    .replaceAll('î', 'i')
    .replaceAll('ï', 'i')
    .replaceAll('ó', 'o')
    .replaceAll('ò', 'o')
    .replaceAll('ô', 'o')
    .replaceAll('ö', 'o')
    .replaceAll('ú', 'u')
    .replaceAll('ù', 'u')
    .replaceAll('û', 'u')
    .replaceAll('ü', 'u')
    .replaceAll('ñ', 'n')
    .replaceAll('ç', 'c')
}

function buildTriggeredAbilityVariants(selectedAbility: string): string[] {
  const abilityType = selectedAbility
    .replace(/<b>(?:Forced |Conflict |\[conflict-(?:military|political)\] Conflict )?/, '')
    .replace('</b>', '')
  const variants = [selectedAbility]

  if (selectedAbility === `<b>${abilityType}</b>`) {
    variants.push(
      `<b>Conflict ${abilityType}</b>`,
      `<b>[conflict-military] Conflict ${abilityType}</b>`,
      `<b>[conflict-political] Conflict ${abilityType}</b>`
    )
    if (abilityType === 'Reaction:' || abilityType === 'Interrupt:') {
      variants.push(`<b>Forced ${abilityType}</b>`)
    }
  } else if (selectedAbility === `<b>Conflict ${abilityType}</b>`) {
    variants.push(
      `<b>[conflict-military] Conflict ${abilityType}</b>`,
      `<b>[conflict-political] Conflict ${abilityType}</b>`
    )
  }

  return variants
}

export function applyFilters(
  cards: CardWithVersions[],
  formats: Format[],
  filter: FilterState
): CardWithVersions[] {
  let filteredCards = cards
  let chosenFormat = filter.format && formats.find((format) => format.id === filter.format)
  if (chosenFormat) {
    let legalPacksOfFormat = chosenFormat.legal_packs || []
    if (filter.banned === 'only' || filter.restricted === 'only') {
      if (filter.banned === 'only') {
        filteredCards = filteredCards.filter((c) => c.banned_in?.includes(filter.format))
      } else {
        filteredCards = filteredCards.filter((c) => c.restricted_in?.includes(filter.format))
      }
    } else {
      if (filter.illegal === 'false') {
        filteredCards = filteredCards.filter((c) =>
          c.versions.some(
            (version) =>
              legalPacksOfFormat.some((pack) => version.pack_id === pack) &&
              (chosenFormat.id != 'emerald' || !version.rotated)
          )
        )
      }
      if (filter.restricted === 'false') {
        filteredCards = filteredCards.filter((c) => !c.restricted_in?.includes(filter.format))
      }
      if (filter.banned === 'false') {
        filteredCards = filteredCards.filter((c) => !c.banned_in?.includes(filter.format))
      }
    }
  }
  if (filter.factions && filter.factions.length > 0) {
    filteredCards = filteredCards.filter((c) => filter.factions?.includes(c.faction))
  }
  if (filter.cardTypes && filter.cardTypes.length > 0) {
    filteredCards = filteredCards.filter((c) => filter.cardTypes?.includes(c.type))
  }
  if (filter.sides && filter.sides.length > 0) {
    filteredCards = filteredCards.filter((c) => filter.sides?.includes(c.side))
  }
  if (filter.traits && filter.traits.length > 0) {
    filteredCards = filteredCards.filter((c) =>
      filter.traits?.every((trait) => c.traits?.includes(trait))
    )
  }
  if (filter.action) {
    const variants = buildTriggeredAbilityVariants(filter.action)
    filteredCards = filteredCards.filter((c) =>
      variants.some((variant) => c.text?.includes(variant))
    )
  }
  if (filter.keyword) {
    const keywordRegex = new RegExp(`\\b${filter.keyword}\\b`)
    filteredCards = filteredCards.filter((c) => c.text && keywordRegex.test(c.text))
  }
  if (filter.elements && filter.elements.length > 0) {
    filteredCards = filteredCards.filter((c) =>
      filter.elements?.find((element) => c.elements?.includes(element))
    )
  }
  if (filter.roleRestrictions && filter.roleRestrictions.length > 0) {
    filteredCards = filteredCards.filter((c) =>
      filter.roleRestrictions?.find((restriction) => c.role_restrictions.includes(restriction))
    )
  }
  if (filter.packs && filter.packs.length > 0) {
    filteredCards = filteredCards.filter((c) =>
      c.versions?.some((version) => filter.packs?.includes(version.pack_id))
    )
  }
  if (filter.isUnique) {
    filteredCards = filteredCards.filter((c) => c.is_unique === (filter.isUnique === 'true'))
  }
  if (filter.numericValues) {
    filteredCards = filteredCards.filter((c) => filterNumericCardValues(c, filter.numericValues))
  }
  if (filter.text) {
    const query = replaceSpecialCharacters(filter.text)
    filteredCards = filteredCards.filter(
      (c) =>
        replaceSpecialCharacters(c.name).includes(query) ||
        c.id.toLocaleLowerCase().includes(query) ||
        replaceSpecialCharacters(c.text || '').includes(query) ||
        c.traits?.some((trait) => trait.toLowerCase().includes(query)) ||
        c.versions?.some((version) =>
          replaceSpecialCharacters(version.illustrator || '').includes(query)
        )
    )
  }
  return filteredCards
}

export const initialState: FilterState = {
  cardTypes: [],
  factions: [],
  packs: [],
  sides: [],
  text: '',
  traits: [],
  action: '',
  keyword: '',
  elements: [],
  roleRestrictions: [],
  cycles: [],
  numericValues: [],
  format: '',
  restricted: 'true',
  banned: 'false',
  illegal: 'false',
  isUnique: '',
}

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case FilterType.FILTER_ALL:
      return { ...action.filter }
    case FilterType.FILTER_TEXT:
      return { ...state, text: action.text }
    case FilterType.FILTER_FACTIONS:
      return { ...state, factions: action.factions }
    case FilterType.FILTER_CARD_TYPES: {
      const elements = action.cardTypes.includes('province') ? state.elements : []
      return { ...state, cardTypes: action.cardTypes, elements: elements }
    }
    case FilterType.FILTER_SIDES:
      return { ...state, sides: action.sides }
    case FilterType.FILTER_TRAITS:
      return { ...state, traits: action.traits }
    case FilterType.FILTER_ACTION:
      return { ...state, action: action.action }
    case FilterType.FILTER_KEYWORD:
      return { ...state, keyword: action.keyword }
    case FilterType.FILTER_ELEMENTS:
      return { ...state, elements: action.elements }
    case FilterType.FILTER_ROLE_RESTRICTIONS:
      return { ...state, roleRestrictions: action.restrictions }
    case FilterType.FILTER_PACKS:
      return { ...state, packs: action.packs }
    case FilterType.FILTER_CYCLES:
      return { ...state, cycles: action.cycles }
    case FilterType.FILTER_PACKS_AND_CYCLES:
      return { ...state, packs: action.packs, cycles: action.cycles }
    case FilterType.FILTER_IS_UNIQUE:
      return { ...state, isUnique: action.isUnique }
    case FilterType.FILTER_FORMAT:
      return { ...state, format: action.format }
    case FilterType.FILTER_RESTRICTED:
      return { ...state, restricted: action.showRestricted }
    case FilterType.FILTER_BANNED:
      return { ...state, banned: action.showBanned }
    case FilterType.FILTER_ILLEGAL:
      return { ...state, illegal: action.showIllegal }
    case FilterType.FILTER_NUMERIC_VALUES:
      return { ...state, numericValues: [...action.numericValues] }
    case FilterType.FILTER_RESET:
      return initialState
  }
}

function renderTriggeredAbilityInputWithIcon(
  params: any,
  selectedOption: { icon?: string } | undefined
): JSX.Element {
  return (
    <TextField
      {...params}
      size="small"
      label="Triggered Ability"
      variant="outlined"
      InputProps={{
        ...params.InputProps,
        startAdornment: selectedOption?.icon ? (
          <>
            <span className={`icon icon-${selectedOption.icon}`} style={{ marginRight: 2 }} />
            {params.InputProps.startAdornment}
          </>
        ) : (
          params.InputProps.startAdornment
        ),
      }}
    />
  )
}

export function CardFilter(props: {
  filterState: FilterState | undefined
  onFilterChanged: (filter: FilterState) => void
  fullWidth?: boolean
  deckbuilder?: boolean
}): JSX.Element {
  const { traits, relevantFormats } = useUiStore()
  const [initialFilterState, setInitialFilterState] = useState<FilterState>(
    props.filterState || initialState
  )
  const [filterState, dispatchFilter] = useReducer(filterReducer, initialFilterState)
  const [searchTerm, setSearchTerm] = useState(props.filterState?.text || '')
  const [showFilters, setShowFilters] = useState(false)

  const yesNoOptions: { id: 'true' | 'false'; name: string }[] = [
    { id: 'true', name: 'Yes' },
    { id: 'false', name: 'No' },
  ]

  const illegalOptions: { id: 'true' | 'false'; name: string }[] = [
    { id: 'true', name: 'All Packs' },
    { id: 'false', name: 'Only Legal Packs' },
  ]

  const restrictedBannedOptions: { id: 'true' | 'false' | 'only'; name: string }[] = [
    { id: 'true', name: 'Yes' },
    { id: 'false', name: 'No' },
    { id: 'only', name: 'Only' },
  ]

  const triggeredAbilityOptions: { id: string; name: string; searchText: string; icon?: string }[] =
    [
      { id: 'action:', name: 'Action', searchText: '<b>Action:</b>' },
      { id: 'conflict-action:', name: 'Conflict Action', searchText: '<b>Conflict Action:</b>' },
      {
        id: 'conflict-military-action:',
        name: 'Conflict Action',
        searchText: '<b>[conflict-military] Conflict Action:</b>',
        icon: 'conflict-military',
      },
      {
        id: 'conflict-political-action:',
        name: 'Conflict Action',
        searchText: '<b>[conflict-political] Conflict Action:</b>',
        icon: 'conflict-political',
      },
      { id: 'reaction:', name: 'Reaction', searchText: '<b>Reaction:</b>' },
      { id: 'forced-reaction:', name: 'Forced Reaction', searchText: '<b>Forced Reaction:</b>' },
      { id: 'interrupt:', name: 'Interrupt', searchText: '<b>Interrupt:</b>' },
      { id: 'forced-interrupt:', name: 'Forced Interrupt', searchText: '<b>Forced Interrupt:</b>' },
      { id: 'duel-challenge:', name: 'Duel Challenge', searchText: '<b>Duel Challenge:</b>' },
      { id: 'duel-focus:', name: 'Duel Focus', searchText: '<b>Duel Focus:</b>' },
      { id: 'duel-strike:', name: 'Duel Strike', searchText: '<b>Duel Strike:</b>' },
    ]

  const keywordOptions: { id: string; name: string; searchText: string }[] = [
    { id: 'ancestral', name: 'Ancestral', searchText: 'Ancestral' },
    { id: 'composure', name: 'Composure', searchText: 'Composure' },
    { id: 'courtesy', name: 'Courtesy', searchText: 'Courtesy' },
    { id: 'covert', name: 'Covert', searchText: 'Covert' },
    { id: 'disguised', name: 'Disguised', searchText: 'Disguised' },
    { id: 'eminent', name: 'Eminent', searchText: 'Eminent' },
    { id: 'legendary', name: 'Legendary', searchText: 'Legendary' },
    { id: 'limited', name: 'Limited', searchText: 'Limited' },
    { id: 'no-attachments', name: 'No attachments', searchText: 'No attachments' },
    { id: 'no-duels', name: 'No duels', searchText: 'No duels' },
    { id: 'pride', name: 'Pride', searchText: 'Pride' },
    { id: 'rally', name: 'Rally', searchText: 'Rally' },
    { id: 'restricted', name: 'Restricted', searchText: 'Restricted' },
    { id: 'sincerity', name: 'Sincerity', searchText: 'Sincerity' },
    { id: 'support', name: 'Support', searchText: 'Support' },
    { id: 'thriving', name: 'Thriving', searchText: 'Thriving' },
  ]

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  useEffect(() => {
    dispatchFilter({ type: FilterType.FILTER_TEXT, text: debouncedSearchTerm })
  }, [debouncedSearchTerm])

  const [packModalOpen, setPackModalOpen] = useState(false)

  if (props.filterState && !isEqual(initialFilterState, props.filterState)) {
    if (props.filterState.text) {
      setSearchTerm(props.filterState.text)
    }
    dispatchFilter({ type: FilterType.FILTER_ALL, filter: props.filterState })
    setInitialFilterState(props.filterState)
  }

  useEffect(() => props.onFilterChanged(filterState), [filterState])

  const visibleFactions = props.deckbuilder
    ? factions.filter((faction) => faction.id !== 'shadowlands')
    : factions
  const visibleCardtypes = props.deckbuilder
    ? cardTypes.filter((cardType) => cardType.id !== 'treaty' && cardType.id !== 'warlord')
    : cardTypes
  const visibleSides = props.deckbuilder
    ? sides.filter((side) => side.id !== 'treaty')
    : sides.filter((side) => side.id !== 'treaty' && side.id !== 'role')

  function updateFilteredPacksAndCycles(newPackIds: string[], newCycleIds: string[]) {
    dispatchFilter({
      type: FilterType.FILTER_PACKS_AND_CYCLES,
      packs: newPackIds,
      cycles: newCycleIds,
    })
  }

  function toggleItemInArray(items: string[], id: string): string[] {
    const newItems = [...items]
    if (newItems.includes(id)) {
      const index = newItems.indexOf(id)
      newItems.splice(index, 1)
    } else {
      newItems.push(id)
    }
    return newItems
  }

  function toggleFactionFilter(id: string) {
    const newFactions = toggleItemInArray(filterState.factions, id)
    dispatchFilter({ type: FilterType.FILTER_FACTIONS, factions: newFactions })
  }

  function toggleCardTypeFilter(id: string) {
    const newCardTypes = toggleItemInArray(filterState.cardTypes, id)
    dispatchFilter({ type: FilterType.FILTER_CARD_TYPES, cardTypes: newCardTypes })
  }

  function toggleElementFilter(id: string) {
    const newElements = toggleItemInArray(filterState.elements, id)
    dispatchFilter({ type: FilterType.FILTER_ELEMENTS, elements: newElements })
  }

  function toggleSideFilter(id: string) {
    const newSides = toggleItemInArray(filterState.sides, id)
    dispatchFilter({ type: FilterType.FILTER_SIDES, sides: newSides })
  }

  function updateNumericFilter(
    valueType: NumericCardValue,
    filterType: ValueFilterType,
    value: string
  ) {
    const newFilters = [...filterState.numericValues]
    const index = newFilters.findIndex((filter) => filter.name === valueType)
    if (index >= 0) {
      newFilters.splice(index, 1)
    }
    if (value) {
      newFilters.push({ name: valueType, typeAndValue: { type: filterType, value: value } })
    }
    dispatchFilter({ type: FilterType.FILTER_NUMERIC_VALUES, numericValues: newFilters })
  }

  const findTraits = (stringTraits?: string[]) => {
    const result: Trait[] = []
    if (stringTraits) {
      stringTraits.forEach((stringTrait) => {
        const traitItem = traits.find((item) => item.id === stringTrait)
        if (traitItem) {
          result.push(traitItem)
        }
      })
    }
    return result
  }

  const findRoleRestrictions = (stringRestrictions?: string[]) => {
    const result: RoleRestriction[] = []
    if (stringRestrictions) {
      stringRestrictions.forEach((stringRestriction) => {
        const restrictionItem = roleRestrictions.find((item) => item.id === stringRestriction)
        if (restrictionItem) {
          result.push(restrictionItem)
        }
      })
    }
    return result
  }

  return (
    <StyledPaper className={classes.filter}>
      <Grid container spacing={1} justifyContent="flex-end">
        <Grid size={{ xs: 12, sm: 8, md: !props.fullWidth ? 6 : 10 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label={
              props.deckbuilder ? 'Search...' : 'Search for card name, ability text, artist...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: !props.fullWidth ? 6 : 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: props.fullWidth ? 6 : 12 }}>
              <Collapse in={props.deckbuilder || showFilters}>
                <Grid container spacing={props.deckbuilder ? 0.75 : 1}>
                  <Grid
                    className={
                      props.deckbuilder ? classes.filterGridItemBuilder : classes.filterGridItem
                    }
                    size={12}
                  >
                    <ButtonGroup fullWidth className={classes.buttonGroup}>
                      {visibleFactions.map((faction) => (
                        <Tooltip key={faction.id} title={faction.name}>
                          <Button
                            disableTouchRipple
                            onClick={() => toggleFactionFilter(faction.id)}
                            style={{
                              backgroundColor: filterState.factions.includes(faction.id)
                                ? faction.color
                                : '',
                            }}
                            className={classes.button}
                          >
                            <span
                              className={`icon icon-clan-${faction.id}`}
                              style={{
                                color: filterState.factions.includes(faction.id)
                                  ? 'white'
                                  : faction.color,
                              }}
                            />
                          </Button>
                        </Tooltip>
                      ))}
                    </ButtonGroup>
                  </Grid>
                  <Grid
                    className={
                      props.deckbuilder ? classes.filterGridItemBuilder : classes.filterGridItem
                    }
                    size={12}
                  >
                    <ButtonGroup fullWidth className={classes.buttonGroup}>
                      {visibleCardtypes.map((type) => (
                        <Tooltip key={type.id} title={type.name}>
                          <Button
                            disableTouchRipple
                            onClick={() => toggleCardTypeFilter(type.id)}
                            style={{
                              backgroundColor: filterState.cardTypes.includes(type.id)
                                ? 'dimgrey'
                                : 'white',
                            }}
                            className={classes.button}
                          >
                            <CardTypeIcon
                              type={type.id}
                              defaultColor={
                                filterState.cardTypes.includes(type.id) ? 'white' : 'black'
                              }
                            />
                          </Button>
                        </Tooltip>
                      ))}
                    </ButtonGroup>
                  </Grid>
                  {filterState.cardTypes.includes('province') && (
                    <Grid
                      className={
                        props.deckbuilder ? classes.filterGridItemBuilder : classes.filterGridItem
                      }
                      size={12}
                    >
                      <ButtonGroup fullWidth className={classes.buttonGroup}>
                        {elements.map((element) => (
                          <Tooltip key={element.id} title={element.name}>
                            <Button
                              disableTouchRipple
                              onClick={() => toggleElementFilter(element.id)}
                              style={{
                                backgroundColor: filterState.elements.includes(element.id)
                                  ? 'dimgrey'
                                  : 'white',
                              }}
                              className={classes.button}
                            >
                              <span
                                style={{
                                  color: filterState.elements.includes(element.id)
                                    ? 'white'
                                    : 'black',
                                }}
                              >
                                <ElementSymbol
                                  element={element.id}
                                  withoutName={props.deckbuilder || false}
                                />
                              </span>
                            </Button>
                          </Tooltip>
                        ))}
                      </ButtonGroup>
                    </Grid>
                  )}
                  <Grid
                    className={
                      props.deckbuilder ? classes.filterGridItemBuilder : classes.filterGridItem
                    }
                    size={12}
                  >
                    <ButtonGroup fullWidth className={classes.buttonGroup}>
                      {visibleSides.map((side) => (
                        <Tooltip key={side.id} title={side.name}>
                          <Button
                            disableTouchRipple
                            onClick={() => toggleSideFilter(side.id)}
                            style={{
                              backgroundColor: filterState.sides.includes(side.id)
                                ? 'dimgrey'
                                : 'white',
                            }}
                            className={classes.button}
                          >
                            <Typography
                              variant="inherit"
                              style={{
                                color: filterState.sides.includes(side.id) ? 'white' : 'black',
                              }}
                            >
                              {side.name}
                            </Typography>
                          </Button>
                        </Tooltip>
                      ))}
                    </ButtonGroup>
                  </Grid>
                  {/* 6 numeric filters underneath the button filters */}
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span className={`icon icon-conflict-military`} />}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.MILITARY, type, value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span className={`icon icon-conflict-political`} />}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.POLITICAL, type, value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span>Cost:</span>}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.COST, type, value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span>Inf:</span>}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.INFLUENCE, type, value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span>Glory:</span>}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.GLORY, type, value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CardValueFilter
                      valueLabel={<span>Str:</span>}
                      onFilterChange={(type, value) =>
                        updateNumericFilter(NumericCardValue.STRENGTH, type, value)
                      }
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
            <Grid size={{ xs: 12, md: props.fullWidth ? 6 : 12 }}>
              <Collapse in={showFilters}>
                <Grid container spacing={1}>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-traits"
                      autoHighlight
                      multiple
                      options={[...traits].sort((a, b) => a.name.localeCompare(b.name))}
                      getOptionLabel={(option) => option.name}
                      value={findTraits(filterState.traits)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" label="Traits" variant="outlined" />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_TRAITS,
                          traits: value.map((item) => item.id),
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-triggered-ability"
                      autoHighlight
                      options={triggeredAbilityOptions}
                      getOptionLabel={(option) => option.name}
                      value={
                        triggeredAbilityOptions.find(
                          (option) => option.searchText === filterState.action
                        ) || null
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.icon && (
                            <span
                              className={`icon icon-${option.icon}`}
                              style={{ marginRight: 8 }}
                            />
                          )}
                          {option.name}
                        </li>
                      )}
                      renderInput={(params) =>
                        renderTriggeredAbilityInputWithIcon(
                          params,
                          triggeredAbilityOptions.find(
                            (option) => option.searchText === filterState.action
                          )
                        )
                      }
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_ACTION,
                          action: value?.searchText || '',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-keyword"
                      autoHighlight
                      options={keywordOptions}
                      getOptionLabel={(option) => option.name}
                      value={
                        keywordOptions.find(
                          (option) => option.searchText === filterState.keyword
                        ) || null
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" label="Keyword" variant="outlined" />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_KEYWORD,
                          keyword: value?.searchText || '',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-is-unique"
                      autoHighlight
                      options={yesNoOptions}
                      getOptionLabel={(option) => option?.name || ''}
                      value={yesNoOptions.find((option) => option.id === filterState.isUnique)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" label="Is Unique" variant="outlined" />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_IS_UNIQUE,
                          isUnique: value?.id || '',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-role-restriction-in"
                      autoHighlight
                      options={roleRestrictions}
                      multiple
                      getOptionLabel={(option) => option?.name || ''}
                      value={findRoleRestrictions(filterState.roleRestrictions)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Role Restriction"
                          variant="outlined"
                        />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_ROLE_RESTRICTIONS,
                          restrictions: value.map((item) => item.id),
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-format"
                      autoHighlight
                      options={relevantFormats}
                      getOptionLabel={(option) => option?.name || ''}
                      value={relevantFormats.find((format) => format.id === filterState.format)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Choose a format"
                          variant="outlined"
                        />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_FORMAT,
                          format: value?.id || '',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-is-illegal"
                      autoHighlight
                      options={illegalOptions}
                      disabled={!filterState.format}
                      getOptionLabel={(option) => option?.name || ''}
                      value={illegalOptions.find((option) => option.id === filterState.illegal)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Pack Legality"
                          variant="outlined"
                        />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_ILLEGAL,
                          showIllegal: value?.id || 'true',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-restricted-in"
                      disabled={!filterState.format}
                      autoHighlight
                      options={restrictedBannedOptions}
                      getOptionLabel={(option) => option?.name || ''}
                      value={restrictedBannedOptions.find(
                        (option) => option.id === filterState.restricted
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Show Restricted Cards"
                          variant="outlined"
                        />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_RESTRICTED,
                          showRestricted: value?.id || 'true',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Autocomplete
                      id="combo-box-banned-in"
                      autoHighlight
                      options={restrictedBannedOptions}
                      disabled={!filterState.format}
                      getOptionLabel={(option) => option?.name || ''}
                      value={restrictedBannedOptions.find(
                        (option) => option.id === filterState.banned
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Show Banned Cards"
                          variant="outlined"
                        />
                      )}
                      onChange={(e, value) =>
                        dispatchFilter({
                          type: FilterType.FILTER_BANNED,
                          showBanned: value?.id || 'false',
                        })
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => setPackModalOpen(true)}
                    >
                      Filter Packs
                      {filterState.packs.length > 0 && ` (Selected: ${filterState.packs.length})`}
                    </Button>
                  </Grid>
                  <Grid size={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      className={classes.clearButton}
                      onClick={() => dispatchFilter({ type: FilterType.FILTER_RESET })}
                    >
                      Reset filters
                    </Button>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        open={packModalOpen}
        onClose={() => setPackModalOpen(false)}
        className={classes.packDialog}
        disableScrollLock
      >
        <DialogTitle id="form-dialog-title">Filter Packs</DialogTitle>
        <DialogContent>
          <div className={classes.packFilter}>
            <CycleList
              withCheckbox
              rootLabel="All Packs"
              onSelection={updateFilteredPacksAndCycles}
              selectedPacks={filterState.packs}
              selectedCycles={filterState.cycles}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackModalOpen(false)} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  )
}
