import { Pack, CardWithVersions, DecklistViewModel } from '@5rdb/api'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { useState, type JSX } from 'react'
import { useUiStore } from '../../providers/UiStoreProvider'

function mapDeckStringToCards(
  deckString: string,
  cards: CardWithVersions[],
  packs: Pack[]
): Record<string, number> {
  const lines = deckString.split('\n')
  const newCards: Record<string, number> = {}
  lines.forEach((line) => {
    line = line.trim()
    let index = 2

    const amount = parseInt(line[0])
    if (isNaN(amount)) {
      return
    }

    if (line[1] === 'x') {
      index++
    }

    const packOffset = line.lastIndexOf('(')
    const cardName = line.substr(index, packOffset === -1 ? line.length : packOffset - index - 1)
    let packName = packOffset > -1 ? line.substr(packOffset + 1, line.length - packOffset - 2) : ''

    // Workaround for BB using the wrong pack name
    if (packName === 'Clan Wars') {
      packName = 'Clan War'
    }

    const pack = packs.find((pack) => pack.name.toLowerCase() === packName.toLowerCase())
    const card = cards.find(
      (card) =>
        card.name.toLowerCase() === cardName.toLowerCase() &&
        card.versions.some((version) => version.pack_id === pack?.id)
    )

    if (card) {
      newCards[card.id] = amount
    }
  })

  return newCards
}

export function JigokuImportButton(props: {
  onImport: (decklist: DecklistViewModel) => void
}): JSX.Element {
  const { cards, packs, formats } = useUiStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [format, setFormat] = useState('')
  const [deckString, setDeckString] = useState('')
  const [loading, setLoading] = useState(false)
  const isSmOrSmaller = useMediaQuery('(max-width:400px)')

  function importJigokuDeck() {
    setLoading(true)
    const cardsInDeck = mapDeckStringToCards(deckString, cards, packs)
    if (cardsInDeck) {
      props.onImport({
        id: '',
        name: 'New Deck',
        format: format,
        version_number: '0.1',
        cards: cardsInDeck,
      })
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant="contained" color="secondary" fullWidth onClick={() => setModalOpen(true)}>
        Import from Jigoku
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} disableScrollLock>
        <DialogTitle>Import from Jigoku</DialogTitle>
        <DialogContent>
          <Autocomplete
            id="combo-box-format"
            autoHighlight
            options={formats}
            getOptionLabel={(option) => option.name}
            value={formats.find((item) => item.id === format) || null}
            renderInput={(params) => <TextField {...params} label="Format" variant="outlined" />}
            onChange={(e, value) => setFormat(value?.id || '')}
          />
          <br />
          <TextField
            value={deckString}
            multiline
            maxRows={10}
            variant="outlined"
            fullWidth
            onChange={(e) => setDeckString(e.target.value)}
            label="Jigoku Export"
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
            disabled={deckString === '' || format === '' || loading}
            onClick={() => importJigokuDeck()}
          >
            Import Deck
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
