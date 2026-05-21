import { Box, Grid, Typography, Card, CardContent } from '@mui/material'
import { useParams } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { RequestError } from '../components/RequestError'
import { useDecklist } from '../hooks/useDecklist'
import { Decklist } from '../components/deck/Decklist'
import { getColorForFactionId } from '../utils/factionUtils'
import { DecklistComments } from '../components/deck/DecklistComments'
import { DeckStatisticsDisplay } from '../components/deck/DeckStatisticsDisplay'
import { useUiStore } from '../providers/UiStoreProvider'
import { Pack } from '@5rdb/api'

import type { JSX } from 'react'

export function DeckDetailView(): JSX.Element {
  const params = useParams<{ id: string }>()
  const [data] = useDecklist(params.id!)
  const { cards, packs } = useUiStore()

  if (data.loading) {
    return <Loading />
  }
  if (data.error) {
    return <RequestError requestError={data.error} />
  }
  if (data.data == null) {
    return <EmptyState />
  }

  const decklist = data.data
  document.title = `${decklist.name} (v${decklist.version_number})`
  return (
    <Box sx={{ pb: 4, maxWidth: 1400, mx: 'auto', px: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Decklist decklist={decklist} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography component="h6" align="right">
                    Created by: <b>{decklist.username}</b>
                  </Typography>
                  <Typography>
                    <b>Description:</b>
                  </Typography>
                  <Box
                    border="1px solid"
                    borderRadius="4px"
                    p={2}
                    borderColor={getColorForFactionId(decklist.primary_clan || '')}
                  >
                    {decklist.description ? (
                      <Typography>
                        {decklist.description.split('\n').map((line, key) => (
                          <span key={key}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </Typography>
                    ) : (
                      <Typography>No description provided</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid hidden={!decklist.published_date} size={12}>
              <Card>
                <CardContent>
                  <DecklistComments decklistId={decklist.id} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={12}>
              <Card>
                <CardContent>
                  <DeckStatisticsDisplay
                    cards={decklist.cards}
                    allCards={cards}
                    allPacks={packs}
                    format={decklist.format}
                    cardPackIds={decklist.card_pack_ids}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
