import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type JSX } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSnackbar } from 'notistack'
import { Loading } from '../components/Loading'
import { RequestError } from '../components/RequestError'
import { useUiStore } from '../providers/UiStoreProvider'
import { privateApi } from '../api'
import type { Cycle, Pack } from '@5rdb/api'

function toDateInputValue(released_at: unknown): string {
  if (!released_at) return ''
  // The Pack type says `Date | undefined`, but at runtime this is either an
  // ISO-8601 string (from the JSON fetch) or a real Date (if something ever
  // hands us one locally). Normalize both through Date so slice(0, 10)
  // always yields the YYYY-MM-DD form an <input type="date"> expects.
  try {
    const iso = new Date(released_at as string | number | Date).toISOString()
    return iso.slice(0, 10)
  } catch {
    return ''
  }
}

export function EditPackView(): JSX.Element {
  const { packs, cycles } = useUiStore()
  const params = useParams<{ id: string }>()

  if (!packs || !cycles) {
    return <Loading />
  }
  const pack = packs.find((p) => p.id === params.id)
  if (!pack) {
    return <RequestError requestError="No pack for that ID!" />
  }

  return <EditPackForm pack={pack} cycles={cycles} />
}

function EditPackForm(props: { pack: Pack; cycles: Cycle[] }): JSX.Element {
  const { pack, cycles } = props
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { invalidateData } = useUiStore()

  const [name, setName] = useState(pack.name)
  const [position, setPosition] = useState(pack.position)
  const [releasedAt, setReleasedAt] = useState(toDateInputValue(pack.released_at))
  const [publisherId, setPublisherId] = useState(pack.publisher_id ?? '')
  const [cycleId, setCycleId] = useState(pack.cycle_id)
  const [rotated, setRotated] = useState(pack.rotated)
  const [saving, setSaving] = useState(false)

  const cycleValue = cycles.find((c) => c.id === cycleId) ?? null

  async function save() {
    setSaving(true)
    try {
      await privateApi.Pack.create({
        body: {
          id: pack.id,
          name,
          position,
          cycle_id: cycleId,
          publisher_id: publisherId || undefined,
          released_at: releasedAt || undefined,
          rotated,
        },
      })
      await invalidateData()
      enqueueSnackbar('Pack updated', { variant: 'success' })
      navigate('/admin/cycles')
    } catch (error) {
      console.log(error)
      enqueueSnackbar("Couldn't update pack", { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Pack
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ID: {pack.id} (immutable)
            </Typography>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Position"
              type="number"
              value={position}
              onChange={(e) => setPosition(Number.parseInt(e.target.value) || 0)}
              required
              size="small"
            />
            <TextField
              label="Released at"
              type="date"
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Publisher ID"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              placeholder="e.g. L5C01"
              size="small"
            />
            <Autocomplete
              options={[...cycles].sort((a, b) => a.name.localeCompare(b.name))}
              getOptionLabel={(c) => c.name}
              value={cycleValue}
              onChange={(_event, value) => setCycleId(value?.id ?? '')}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => (
                <TextField {...params} label="Cycle" required size="small" />
              )}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rotated}
                  onChange={(e) => setRotated(e.target.checked)}
                />
              }
              label="Rotated out"
            />
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/cycles')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={save}
          disabled={saving || !name || !cycleId}
        >
          Save
        </Button>
      </Box>
    </Box>
  )
}
