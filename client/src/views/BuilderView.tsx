import { DeckWithVersions } from '@5rdb/api'
import { Box, Grid, Typography } from '@mui/material'
import { useEffect, useState, type JSX } from 'react'
import { privateApi } from '../api'
import { DeckTabs } from '../components/deck/DeckTabs'
import { useCurrentUser } from '../providers/UserProvider'

export function BuilderView(): JSX.Element {
  const { currentUser } = useCurrentUser()
  const [decks, setDecks] = useState<DeckWithVersions[]>([])

  useEffect(() => {
    // Wait for the user, so the request carries the token
    if (currentUser) {
      privateApi.Deck.findForUser().then((response) => setDecks(response.data()))
    }
  }, [currentUser])

  function updateDecks() {
    privateApi.Deck.findForUser().then((response) => setDecks(response.data()))
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Grid container>
        <Grid size={12}>
          <Typography variant="h4">Decks</Typography>
          <br />
        </Grid>
        <Grid size={12}>
          <DeckTabs decks={decks} onDeckUpdated={updateDecks} />
        </Grid>
      </Grid>
    </Box>
  )
}
