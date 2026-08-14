import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CachedIcon from '@mui/icons-material/Cached'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined'
import { useParams } from 'react-router'
import { Loading } from '../components/Loading'
import { useUiStore } from '../providers/UiStoreProvider'
import { RequestError } from '../components/RequestError'
import { useEffect, useState, type JSX } from 'react'
import { CardInPack } from '@5rdb/api'
import { privateApi } from '../api'
import { useSnackbar } from 'notistack'
import { getImageUrl } from '../utils/imageUrl'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
// Card images are 440 x 616 px; thumbnails hold that ratio whether or not an image is set.
const CARD_ASPECT = '440 / 616'

const EM_DASH = '—'

function CardThumbnail(props: { url?: string; label: string; width: number }): JSX.Element {
  const src = getImageUrl(props.url)
  return (
    <Box
      sx={{
        width: props.width,
        flexShrink: 0,
        aspectRatio: CARD_ASPECT,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={props.label}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <HideImageOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
      )}
    </Box>
  )
}

function FieldValue(props: {
  label: string
  value?: string | number
  mono?: boolean
}): JSX.Element {
  const hasValue = props.value !== undefined && props.value !== null && props.value !== ''
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.secondary',
          lineHeight: 1.4,
        }}
      >
        {props.label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: props.mono ? MONO : undefined,
          color: hasValue ? 'text.primary' : 'text.disabled',
          wordBreak: 'break-word',
        }}
      >
        {hasValue ? props.value : EM_DASH}
      </Typography>
    </Box>
  )
}

export function EditPackCardsView(): JSX.Element {
  const { cards, packs, cycles, invalidateData } = useUiStore()
  const params = useParams<{ id: string }>()
  const [cardId, setCardId] = useState('')
  const [flavor, setFlavor] = useState('')
  const [illustrator, setIllustrator] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [position, setPosition] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [rotated, setRotated] = useState(false)
  const [cardsInPack, setCardsInPack] = useState<CardInPack[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<CardInPack | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  function compareCardsInPack(a: CardInPack, b: CardInPack) {
    const positionA = a.position || '0'
    const positionANumber = Number.parseInt(positionA.replace(/\D/g, ''))
    const positionAExtra = positionA.replace(/[0-9]/g, '')

    const positionB = b.position || '0'
    const positionBNumber = Number.parseInt(positionB.replace(/\D/g, ''))
    const positionBExtra = positionB.replace(/[0-9]/g, '')

    return (
      positionANumber - positionBNumber ||
      positionAExtra.localeCompare(positionBExtra) ||
      a.card_id.localeCompare(b.card_id)
    )
  }

  useEffect(() => {
    if (cards && params.id) {
      const packCards = cards.filter((c) => c.versions.some((v) => v.pack_id === params.id))
      const newCardsInPack: CardInPack[] = packCards
        .map((p) => {
          const cardVersionInPack = p.versions.find((v) => v.pack_id === params.id)
          return {
            ...cardVersionInPack,
            card_id: p.id,
            pack_id: params.id!,
            rotated: cardVersionInPack?.rotated || false,
          }
        })
        .sort((a, b) => compareCardsInPack(a, b))
      setCardsInPack(newCardsInPack)
    }
  }, [cards, params.id])

  if (!cards || !packs) {
    return <Loading />
  }

  const packId = params.id!
  const pack = packs.find((p) => p.id === packId)

  if (!pack) {
    return <RequestError requestError="No pack for that ID!" />
  }

  const cycleName = cycles?.find((c) => c.id === pack.cycle_id)?.name
  const rotatedCount = cardsInPack.filter((c) => c.rotated).length

  async function updateCards() {
    const newCard: CardInPack = {
      card_id: cardId,
      pack_id: packId,
      flavor: flavor,
      illustrator: illustrator,
      image_url: imageUrl,
      position: position,
      quantity: quantity,
      rotated: rotated,
    }
    setSaving(true)
    try {
      await privateApi.CardInPack.update({
        body: {
          cardInPack: newCard,
        },
      })
      await invalidateData()
      enqueueSnackbar(editing ? 'Changes saved' : 'Card added to pack', { variant: 'success' })
      setModalOpen(false)
    } catch (error) {
      console.log(error)
      enqueueSnackbar(
        editing ? "The changes couldn't be saved" : "The card couldn't be added to the pack",
        { variant: 'error' }
      )
    } finally {
      setSaving(false)
    }
  }

  function openDeleteDialog(cardInPack: CardInPack) {
    setCardToDelete(cardInPack)
    setDeleteDialogOpen(true)
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false)
    setCardToDelete(null)
  }

  async function confirmDelete() {
    if (!cardToDelete) return

    try {
      await privateApi.CardInPack.delete({
        body: {
          cardInPack: cardToDelete,
        },
      })
      await invalidateData()
      enqueueSnackbar('Card removed from pack', { variant: 'success' })
      setDeleteDialogOpen(false)
      setCardToDelete(null)
    } catch (error) {
      console.log(error)
      enqueueSnackbar("The card couldn't be removed from the pack", { variant: 'error' })
    }
  }

  function openEditModal(card: CardInPack) {
    setCardId(card.card_id)
    setFlavor(card.flavor || '')
    setIllustrator(card.illustrator || '')
    setImageUrl(card.image_url || '')
    setPosition(card.position || '')
    setQuantity(card.quantity || 1)
    setRotated(card.rotated || false)
    setEditing(true)
    setModalOpen(true)
  }

  function openCreateModal() {
    setCardId('')
    setFlavor('')
    setIllustrator('')
    setImageUrl('')
    setPosition('')
    setQuantity(3)
    setRotated(false)
    setEditing(false)
    setModalOpen(true)
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 6 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-end' }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Box>
          {cycleName && (
            <Typography
              variant="overline"
              sx={{ display: 'block', letterSpacing: '0.12em', color: 'text.secondary' }}
            >
              {cycleName}
            </Typography>
          )}
          <Typography variant="h4">{pack.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {cardsInPack.length} {cardsInPack.length === 1 ? 'card' : 'cards'}
            {rotatedCount > 0 && ` · ${rotatedCount} rotated out`} ·{' '}
            <Box component="span" sx={{ fontFamily: MONO }}>
              {pack.id}
            </Box>
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => openCreateModal()}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-end' }, flexShrink: 0 }}
        >
          Add card
        </Button>
      </Stack>

      <Divider sx={{ mt: 3, mb: 3 }} />

      {cardsInPack.length === 0 ? (
        <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center' }}>
          <Typography variant="h6">No cards in this pack yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
            Add the first printing to start the pack list.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => openCreateModal()}
          >
            Add card
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            // Column count follows the available width, not the viewport: the app shell narrows
            // content to 10 of 12 columns above 1440px, so viewport breakpoints crowd the slips.
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
            gap: 3,
          }}
        >
          {cardsInPack.map((card) => (
            <Card
              key={`${card.card_id}-${card.pack_id}`}
              variant="outlined"
              sx={{
                height: '100%',
                p: 2,
                display: 'flex',
                gap: 2,
                borderLeftWidth: 3,
                borderLeftStyle: 'solid',
                borderLeftColor: card.rotated ? 'error.main' : 'secondary.main',
                transition: 'box-shadow 150ms',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardThumbnail url={card.image_url} label={card.card_id} width={96} />
                <Chip
                  label={card.position || EM_DASH}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    height: 22,
                    borderRadius: 0.5,
                    fontFamily: MONO,
                    fontSize: 12,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      flexGrow: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {card.card_id}
                  </Typography>
                  <Tooltip title="Edit printing">
                    <IconButton
                      size="small"
                      aria-label={`Edit ${card.card_id}`}
                      onClick={() => openEditModal(card)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove from pack">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove ${card.card_id} from pack`}
                      onClick={() => openDeleteDialog(card)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {card.rotated && (
                  <Chip
                    icon={<CachedIcon />}
                    label="Rotated out"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                  />
                )}

                {card.flavor && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {card.flavor}
                  </Typography>
                )}

                <Box
                  sx={{
                    mt: 'auto',
                    pt: 1.5,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    columnGap: 2,
                    rowGap: 1,
                  }}
                >
                  <FieldValue label="Illustrator" value={card.illustrator} />
                  <FieldValue label="Quantity" value={card.quantity} mono />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit ${cardId}` : `Add card to ${pack.name}`}</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 1 }}>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, minWidth: 0 }}
            >
              <Autocomplete
                id="combo-box-cardId"
                autoHighlight
                disabled={editing}
                options={[...cards].sort((a, b) => a.id.localeCompare(b.id))}
                getOptionLabel={(option) => `${option.id}`}
                value={cards.find((item) => item.id === cardId) || null}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label="Card"
                    variant="outlined"
                    size="small"
                    helperText={
                      editing ? 'The card of an existing printing cannot be changed.' : ' '
                    }
                  />
                )}
                onChange={(_event, value) => {
                  setCardId(value?.id || '')
                }}
              />
              <TextField
                value={position}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setPosition(e.target.value)}
                label="Position in pack"
                placeholder="e.g. 22"
              />
              <TextField
                value={quantity}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                type="number"
                label="Quantity"
              />
              <TextField
                value={illustrator}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setIllustrator(e.target.value)}
                label="Illustrator"
              />
              <TextField
                value={imageUrl}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setImageUrl(e.target.value)}
                label="Image URL"
              />
              <TextField
                value={flavor}
                multiline
                minRows={2}
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setFlavor(e.target.value)}
                label="Flavor"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rotated}
                    onChange={(value) => setRotated(value.target.checked)}
                  />
                }
                label="Rotated out"
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Preview
              </Typography>
              <CardThumbnail url={imageUrl} label={cardId || 'Card preview'} width={140} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateCards()}
            disabled={saving || !cardId}
          >
            {editing ? 'Save changes' : 'Add card'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Remove card from pack</DialogTitle>
        <DialogContent>
          {cardToDelete && (
            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <CardThumbnail
                  url={cardToDelete.image_url}
                  label={cardToDelete.card_id}
                  width={72}
                />
                <Chip
                  label={cardToDelete.position || EM_DASH}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    height: 22,
                    borderRadius: 0.5,
                    fontFamily: MONO,
                    fontSize: 12,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: MONO, wordBreak: 'break-all' }}>
                  {cardToDelete.card_id}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  This removes the printing from {pack.name}. The card itself stays in the database.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Remove card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
