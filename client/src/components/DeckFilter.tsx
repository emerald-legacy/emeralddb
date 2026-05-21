import { useEffect, useReducer, useState, type JSX } from 'react'
import { styled } from '@mui/material/styles'
import { PublishedDecklist } from '@5rdb/api'
import { Button, lighten, Grid, Paper, TextField } from '@mui/material'
import { clans } from '../utils/enums'
import Autocomplete from '@mui/material/Autocomplete'
import { useUiStore } from '../providers/UiStoreProvider'

const PREFIX = 'DeckFilter'

const classes = {
  filter: `${PREFIX}-filter`,
  clearIcon: `${PREFIX}-clearIcon`,
  clearButton: `${PREFIX}-clearButton`,
  button: `${PREFIX}-button`,
  filterGridItem: `${PREFIX}-filterGridItem`,
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
    height: 32,
    minWidth: 16,
  },

  [`& .${classes.filterGridItem}`]: {
    height: 40,
    margin: '4px 0',
  },

  [`& .${classes.traitTextField}`]: {
    maxHeight: 32,
  },

  [`& .${classes.packDialog}`]: {
    padding: theme.spacing(1),
  },

  [`& .${classes.packFilter}`]: {
    minWidth: '60%',
  },
}))

export interface DeckFilterState {
  format: string
  primaryClan: string
  secondaryClan: string
}

enum FilterType {
  FILTER_ALL,
  FILTER_FORMAT,
  FILTER_PRIMARY,
  FILTER_SECONDARY,
  FILTER_RESET,
}

type FilterAction =
  | { type: FilterType.FILTER_ALL; filter: DeckFilterState }
  | { type: FilterType.FILTER_FORMAT; format: string }
  | { type: FilterType.FILTER_PRIMARY; faction: string }
  | { type: FilterType.FILTER_SECONDARY; faction: string }
  | { type: FilterType.FILTER_RESET }

export function applyDeckFilters(
  decks: PublishedDecklist[],
  filter: DeckFilterState
): PublishedDecklist[] {
  let filteredDecks = decks
  if (filter.format) {
    filteredDecks = filteredDecks.filter((d) => filter.format === d.format)
  }
  if (filter.primaryClan) {
    filteredDecks = filteredDecks.filter((d) => filter.primaryClan === d.primary_clan)
  }
  if (filter.secondaryClan) {
    filteredDecks = filteredDecks.filter((d) => filter.secondaryClan === d.secondary_clan)
  }
  return filteredDecks
}

const initialState: DeckFilterState = {
  format: '',
  primaryClan: '',
  secondaryClan: '',
}

function filterReducer(state: DeckFilterState, action: FilterAction): DeckFilterState {
  switch (action.type) {
    case FilterType.FILTER_ALL:
      return { ...action.filter }
    case FilterType.FILTER_FORMAT:
      return { ...state, format: action.format }
    case FilterType.FILTER_PRIMARY:
      return { ...state, primaryClan: action.faction }
    case FilterType.FILTER_SECONDARY:
      return { ...state, secondaryClan: action.faction }
    case FilterType.FILTER_RESET:
      return initialState
  }
}

export function DeckFilter(props: {
  filterState: DeckFilterState | undefined
  onFilterChanged: (filter: DeckFilterState) => void
}): JSX.Element {
  const { relevantFormats } = useUiStore()
  const [initialFilterState] = useState<DeckFilterState>(props.filterState || initialState)
  const [filterState, dispatchFilter] = useReducer(filterReducer, initialFilterState)
  useEffect(() => props.onFilterChanged(filterState), [filterState])

  return (
    <StyledPaper className={classes.filter}>
      <Grid container spacing={1} justifyContent="flex-end">
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            key={filterState.primaryClan}
            id="combo-box-primary"
            autoHighlight
            options={clans}
            getOptionLabel={(option) => option?.name || ''}
            value={clans.find((clan) => clan.id === filterState.primaryClan)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Primary Clan" variant="outlined" />
            )}
            onChange={(e, value) =>
              dispatchFilter({
                type: FilterType.FILTER_PRIMARY,
                faction: value?.id || '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            key={filterState.secondaryClan}
            id="combo-box-secondary"
            autoHighlight
            options={clans}
            getOptionLabel={(option) => option?.name || ''}
            value={clans.find((clan) => clan.id === filterState.secondaryClan)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Splash Clan" variant="outlined" />
            )}
            onChange={(e, value) =>
              dispatchFilter({
                type: FilterType.FILTER_SECONDARY,
                faction: value?.id || '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            key={filterState.format}
            id="combo-box-format"
            autoHighlight
            options={relevantFormats}
            getOptionLabel={(option) => option?.name || ''}
            value={relevantFormats.find((format) => format.id === filterState.format)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Format" variant="outlined" />
            )}
            onChange={(e, value) =>
              dispatchFilter({
                type: FilterType.FILTER_FORMAT,
                format: value?.id || '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Button
            fullWidth
            variant="contained"
            className={`${classes.button} ${classes.clearButton}`}
            onClick={() => dispatchFilter({ type: FilterType.FILTER_RESET })}
          >
            Reset filters
          </Button>
        </Grid>
      </Grid>
    </StyledPaper>
  )
}
