import { DecklistViewModel, Decklist } from '@5rdb/api'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useState, type JSX } from 'react'

const emeraldDBPermalinkPrefix = 'https://www.emeralddb.org/decks/'
const emeraldDBApiPrefix = 'https://www.emeralddb.org/api/decklists/'

export function EmeraldDBImportButton(props: {
  onImport: (decklist: DecklistViewModel) => void
}): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const [permalink, setPermalink] = useState('')
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const isSmOrSmaller = useMediaQuery('(max-width:400px)')

  function importEmeraldDBDeck() {
    setLoading(true)
    if (!permalink.startsWith(emeraldDBPermalinkPrefix)) {
      enqueueSnackbar(`Invalid Permalink, must start with "${emeraldDBPermalinkPrefix}"!`, {
        variant: 'error',
      })
      setLoading(false)
    } else {
      const apiUrl = permalink
        .replace(emeraldDBPermalinkPrefix, emeraldDBApiPrefix)
        .replace('/view', '')
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data: Decklist) => {
          const importedDeck = data
          props.onImport({
            id: '',
            format: importedDeck.format,
            name: importedDeck.name,
            primary_clan: importedDeck.primary_clan,
            secondary_clan: importedDeck.secondary_clan,
            version_number: '0.1',
            description: importedDeck.description,
            cards: importedDeck.cards,
          })
        })
    }
  }

  return (
    <>
      <Button variant="contained" color="secondary" fullWidth onClick={() => setModalOpen(true)}>
        Import from EmeraldDB
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} disableScrollLock>
        <DialogTitle>Import from EmeraldDB</DialogTitle>
        <DialogContent>
          <TextField
            value={permalink}
            variant="outlined"
            fullWidth
            onChange={(e) => setPermalink(e.target.value)}
            label="Permalink"
            style={{ minWidth: isSmOrSmaller ? 250 : 400 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="secondary" variant="contained">
            Close
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={loading}
            onClick={() => importEmeraldDBDeck()}
          >
            Import Deck
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
