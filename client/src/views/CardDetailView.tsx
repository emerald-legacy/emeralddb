import React, { useEffect, useState, type JSX } from 'react'
import { styled } from '@mui/material/styles'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { RequestError } from '../components/RequestError'
import { useCard } from '../hooks/useCard'
import { CardInformation } from '../components/card/CardInformation'
import { CardInPack } from '@5rdb/api'
import { useCurrentUser } from '../providers/UserProvider'
import { RulingList } from '../components/RulingList'
import Autocomplete from '@mui/material/Autocomplete'
import { useUiStore } from '../providers/UiStoreProvider'
import { privateApi } from '../api'
import { useConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import { toSlugId } from '../utils/slugIdUtils'
import { getImageUrl } from '../utils/imageUrl'

const PREFIX = 'CardDetailView'

const classes = {
  unselected: `${PREFIX}-unselected`,
  selected: `${PREFIX}-selected`,
}

const StyledContainer = styled(Container)(({ theme }) => ({
  [`& .${classes.unselected}`]: {
    borderColor: 'lightgrey',
  },

  [`& .${classes.selected}`]: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
}))

export function CardDetailView(): JSX.Element {
  const params = useParams<{ id: string }>()
  const { cards, packs } = useUiStore()
  const [data] = useCard(params.id!)
  const [chosenVersionIndex, setChosenVersionIndex] = useState(0)
  const [chosenVersion, setChosenVersion] = useState<Omit<CardInPack, 'card_id'>>()
  const [deletionModalOpen, setDeletionModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [deletionReplacementCardId, setDeletionReplacementCardId] = useState('')
  const [newCardId, setNewCardId] = useState('')
  const [newName, setNewName] = useState('')
  const [newNameExtra, setNewNameExtra] = useState('')
  const { isDataAdmin } = useCurrentUser()
  const confirm = useConfirm()
  const { enqueueSnackbar } = useSnackbar()

  const navigate = useNavigate()

  useEffect(() => {
    if (data.data) {
      setChosenVersion(data.data.versions[chosenVersionIndex])
    }
  }, [chosenVersionIndex, data])

  if (data.loading) {
    return <Loading />
  }
  if (data.error) {
    return <RequestError requestError={data.error} />
  }
  if (data.data == null) {
    return <EmptyState />
  }

  const card = data.data

  const imageWidth = card.type === 'treaty' ? 450 : 300

  const setIdFromNameAndExtra = (name: string | undefined, name_extra: string | undefined) => {
    const baseName = name || ''
    const extra = name_extra || ''
    const newId = baseName + (extra.length > 0 ? ' ' + extra : '')
    setNewCardId(toSlugId(newId))
  }

  const setNameAndGenerateId = (name: string) => {
    setNewName(name)
    setIdFromNameAndExtra(name, newNameExtra)
  }

  const setNameExtraAndGenerateId = (nameExtra: string) => {
    setNewNameExtra(nameExtra)
    setIdFromNameAndExtra(newName, nameExtra)
  }

  async function confirmDeletion() {
    const { confirmed } = await confirm({
      title: 'Delete Card',
      description: 'Do you really want to delete this card?',
      confirmationText: 'Delete',
    })
    if (!confirmed) return
    privateApi.Card.delete({
      cardId: card.id,
      body: { replacementCardId: deletionReplacementCardId },
    })
      .then(() => {
        if (deletionReplacementCardId) {
          navigate(`/card/${deletionReplacementCardId}`)
        } else {
          navigate('/cards')
        }
        setDeletionModalOpen(false)
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The card couldn't be deleted!", { variant: 'error' })
      })
  }

  async function confirmRename() {
    const { confirmed } = await confirm({
      title: 'Rename Card',
      description: 'Do you really want to rename this card?',
      confirmationText: 'Rename',
    })
    if (!confirmed) return
    privateApi.Card.rename({
      cardId: card.id,
      body: {
        existingCardId: card.id,
        newCardId: newCardId,
        name: newName,
        nameExtra: newNameExtra,
      },
    })
      .then(() => {
        navigate(`/card/${newCardId}`)
        setRenameModalOpen(false)
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The card couldn't be renamed!", { variant: 'error' })
      })
  }

  return (
    <StyledContainer style={{ paddingTop: '5px', paddingBottom: '20px' }}>
      <Card sx={{ marginX: 1 }}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <CardInformation cardWithVersions={card} currentVersion={chosenVersion} />
              {card.versions.length > 1 && (
                <Grid size={12}>
                  <Tabs
                    TabIndicatorProps={{
                      style: {
                        top: 0,
                      },
                    }}
                    value={chosenVersionIndex}
                    onChange={(_, newValue) => setChosenVersionIndex(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {card.versions.map((v, index) => (
                      <Tab
                        key={v.pack_id}
                        value={index}
                        label={
                          <Typography variant="caption">
                            {packs.find((p) => p.id === v.pack_id)?.name || 'Unknown Pack'}
                          </Typography>
                        }
                        className={
                          chosenVersionIndex === index ? classes.selected : classes.unselected
                        }
                      />
                    ))}
                  </Tabs>
                </Grid>
              )}
              <RulingList cardId={card.id} rulings={card.rulings} />
            </Grid>
            <Grid
              container
              spacing={0}
              size={{ xs: 12, md: 5 }}
              display="flex"
              justifyContent="center"
              alignContent="flex-start"
            >
              {chosenVersion && (
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={getImageUrl(chosenVersion.image_url)}
                    style={{ maxWidth: imageWidth, width: '100%', height: 'auto' }}
                  />
                </Grid>
              )}
              {isDataAdmin() && (
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => navigate(`/card/${card.id}/edit`)}
                    style={{ marginTop: 10, maxWidth: imageWidth }}
                  >
                    Edit this Card
                  </Button>
                </Grid>
              )}
              {isDataAdmin() && (
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => setRenameModalOpen(true)}
                    style={{ marginTop: 10, maxWidth: imageWidth }}
                  >
                    Rename this Card
                  </Button>
                </Grid>
              )}
              {isDataAdmin() && (
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => setDeletionModalOpen(true)}
                    style={{ marginTop: 10, maxWidth: imageWidth }}
                  >
                    Delete this Card
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog
        open={deletionModalOpen}
        onClose={() => setDeletionModalOpen(false)}
        disableScrollLock
      >
        <DialogTitle>Delete Card {card.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={12}>
              <Autocomplete
                id="combo-box-cardId"
                autoHighlight
                options={[...cards].sort((a, b) => a.id.localeCompare(b.id))}
                getOptionLabel={(option) => `${option.id}`}
                value={cards.find((item) => item.id === deletionReplacementCardId) || null}
                renderInput={(params) => (
                  <TextField {...params} fullWidth label="Replacement Card" variant="outlined" />
                )}
                onChange={(e, value) => {
                  setDeletionReplacementCardId(value?.id || '')
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletionModalOpen(false)} color="secondary" variant="contained">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => confirmDeletion()}>
            Delete Card
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={renameModalOpen} onClose={() => setRenameModalOpen(false)} disableScrollLock>
        <DialogTitle>Rename Card {card.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="name"
                label="Name"
                value={newName}
                onChange={(e) => setNameAndGenerateId(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="name_extra"
                label="Name Extra"
                value={newNameExtra}
                onChange={(e) => setNameExtraAndGenerateId(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                disabled
                InputLabelProps={{ shrink: true }}
                required
                id="id"
                label="Card ID (generated from Name + Name Extra)"
                value={newCardId}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameModalOpen(false)} color="secondary" variant="contained">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => confirmRename()}>
            Rename Card
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  )
}
