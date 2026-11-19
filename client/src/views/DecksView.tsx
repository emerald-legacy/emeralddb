import { PublishedDecklistWithExtraInfo } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import { Paper, useMediaQuery, Tooltip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useState, type JSX } from 'react'
import { publicApi } from '../api'
import { applyDeckFilters, DeckFilter, DeckFilterState } from '../components/DeckFilter'
import { EmeraldDBLink } from '../components/EmeraldDBLink'
import { UiStoreQueries, useUiStore } from '../providers/UiStoreProvider'
import { getFactionName } from '../utils/factionUtils'
import { CardFactionIcon } from '../components/card/CardFactionIcon'
import { useQuery } from '@tanstack/react-query'

const PREFIX = 'DecksView'

const classes = {
  table: `${PREFIX}-table`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.table}`]: {
    marginTop: theme.spacing(1),
  },
}))

type Row = PublishedDecklistWithExtraInfo

// For columns that show more than one field: the cell value is the whole row,
// sorted by the given texts in order (the second one breaks ties of the first)
function sortByTexts(
  ...texts: ((row: Row) => string)[]
): Pick<GridColDef<Row, Row>, 'valueGetter' | 'sortComparator'> {
  return {
    valueGetter: (_value, row) => row,
    sortComparator: (row1, row2) => {
      for (const text of texts) {
        const result = text(row1).localeCompare(text(row2))
        if (result !== 0) return result
      }
      return 0
    },
  }
}

export function DecksView(): JSX.Element {
  const { formats } = useUiStore()
  const { data: decks = [] } = useQuery({
    queryKey: UiStoreQueries.PUBLISHED_DECKLISTS,
    queryFn: () => publicApi.Decklist.findPublished().then((response) => response.data()),
  })
  const [filter, setFilter] = useState<DeckFilterState | undefined>(undefined)
  const isMdOrBigger = useMediaQuery('(min-width:600px)')

  let sortedDecks = [...decks].sort(
    (a, b) => new Date(b.published_date!).getTime() - new Date(a.published_date!).getTime()
  )

  if (filter) {
    sortedDecks = applyDeckFilters(sortedDecks, filter)
  }

  const columns: GridColDef<Row>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span>
          <EmeraldDBLink href={`/decks/${params.row.id}`}>
            {params.row.name} (v{params.row.version_number})
          </EmeraldDBLink>
        </span>
      ),
    },
    {
      field: 'clans',
      headerName: 'Clans',
      disableColumnMenu: true,
      flex: 1,
      ...sortByTexts(
        (deck) => deck.primary_clan || '',
        (deck) => deck.secondary_clan || ''
      ),
      renderCell: (params) => (
        <Tooltip
          title={`Main: ${getFactionName(params.row.primary_clan) || 'N/A'} / Splash: ${
            getFactionName(params.row.secondary_clan) || 'N/A'
          }`}
        >
          <span>
            {params.row.primary_clan && (
              <CardFactionIcon faction={params.row.primary_clan} colored />
            )}
            {params.row.secondary_clan && (
              <span>
                {' / '}
                <CardFactionIcon faction={params.row.secondary_clan} colored />
              </span>
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'stronghold',
      headerName: 'Stronghold',
      flex: 2,
      disableColumnMenu: true,
      ...sortByTexts((deck) => deck.stronghold?.name || ''),
      renderCell: (params) => <span>{params.row.stronghold?.name || 'N/A'}</span>,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 2,
      disableColumnMenu: true,
      ...sortByTexts((deck) => deck.role?.name || ''),
      renderCell: (params) => <span>{params.row.role?.name || 'N/A'}</span>,
    },
    {
      field: 'format',
      headerName: 'Format',
      disableColumnMenu: true,
      flex: 2,
      renderCell: (params) => (
        <span>{formats.find((format) => format.id === params.row.format)?.name}</span>
      ),
    },
    {
      field: 'username',
      headerName: 'Creator',
      disableColumnMenu: true,
      flex: 2,
    },
    {
      field: 'published_date',
      headerName: 'Published',
      disableColumnMenu: true,
      flex: 2,
      renderCell: (params) => (
        <span>
          {params.row.published_date ? new Date(params.row.published_date).toLocaleString() : 'N/A'}
        </span>
      ),
    },
  ]

  return (
    <Root>
      <DeckFilter onFilterChanged={setFilter} filterState={filter} />
      <Paper className={classes.table}>
        <DataGrid
          disableRowSelectionOnClick
          columns={columns}
          rows={sortedDecks}
          pageSizeOptions={[50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
          }}
          autoHeight
          density="compact"
          columnVisibilityModel={{
            format: isMdOrBigger,
            username: isMdOrBigger,
            published_date: isMdOrBigger,
          }}
        />
      </Paper>
    </Root>
  )
}
