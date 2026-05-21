import { PublishedDecklistWithExtraInfo } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import { Paper, useMediaQuery, Tooltip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useState, type JSX } from 'react'
import { publicApi } from '../api'
import { applyDeckFilters, DeckFilter, DeckFilterState } from '../components/DeckFilter'
import { capitalize } from '../utils/stringUtils'
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

export function DecksView(): JSX.Element {
  const { formats } = useUiStore()
  const { data: decks = [] } = useQuery<PublishedDecklistWithExtraInfo[]>({
    queryKey: UiStoreQueries.PUBLISHED_DECKLISTS,
    queryFn: () =>
      publicApi.Decklist.findPublished().then(
        (response) => response.data() as PublishedDecklistWithExtraInfo[]
      ),
  })
  const [filter, setFilter] = useState<DeckFilterState | undefined>(undefined)
  const isMdOrBigger = useMediaQuery('(min-width:600px)')

  let sortedDecks = [...decks].sort(
    (a, b) => new Date(b.published_date!).getTime() - new Date(a.published_date!).getTime()
  )

  if (filter) {
    sortedDecks = applyDeckFilters(sortedDecks, filter)
  }

  const columns: GridColDef[] = [
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
      valueGetter: (_, row) => row,
      sortComparator: (v1, v2) => {
        const deck1 = v1 as unknown as PublishedDecklistWithExtraInfo
        const deck2 = v2 as unknown as PublishedDecklistWithExtraInfo
        const mainClan1 = deck1.primary_clan || ''
        const mainClan2 = deck2.primary_clan || ''
        const splashClan1 = deck1.secondary_clan || ''
        const splashClan2 = deck2.secondary_clan || ''
        return mainClan1.localeCompare(mainClan2) || splashClan1.localeCompare(splashClan2)
      },
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
      valueGetter: (_, row) => row,
      sortComparator: (v1, v2) => {
        const deck1 = v1 as unknown as PublishedDecklistWithExtraInfo
        const deck2 = v2 as unknown as PublishedDecklistWithExtraInfo
        const strongholdName1 = deck1.stronghold?.name || ''
        const strongholdName2 = deck2.stronghold?.name || ''
        return strongholdName1.localeCompare(strongholdName2)
      },
      renderCell: (params) => <span>{params.row.stronghold?.name || 'N/A'}</span>,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 2,
      disableColumnMenu: true,
      valueGetter: (_, row) => row,
      sortComparator: (v1, v2) => {
        const deck1 = v1 as unknown as PublishedDecklistWithExtraInfo
        const deck2 = v2 as unknown as PublishedDecklistWithExtraInfo
        const roleName1 = deck1.role?.name || ''
        const roleName2 = deck2.role?.name || ''
        return roleName1.localeCompare(roleName2)
      },
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
