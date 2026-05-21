import { Pack } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import React, { useState, type JSX } from 'react'
import { useNavigate } from 'react-router'
import { privateApi } from '../api'
import { Loading } from '../components/Loading'
import { useUiStore } from '../providers/UiStoreProvider'
import { toSlugId } from '../utils/slugIdUtils'
import CachedIcon from '@mui/icons-material/Cached'

const PREFIX = 'ManageCyclesView'

const classes = {
  editButton: `${PREFIX}-editButton`,
  createButton: `${PREFIX}-createButton`,
  deleteButton: `${PREFIX}-deleteButton`,
  input: `${PREFIX}-input`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.editButton}`]: {
    backgroundColor: theme.palette.warning.light,
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },

  [`& .${classes.createButton}`]: {
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
    marginTop: theme.spacing(2),
  },

  [`& .${classes.deleteButton}`]: {
    backgroundColor: theme.palette.error.light,
  },

  [`& .${classes.input}`]: {
    marginBottom: theme.spacing(1),
  },
}))

export function ManageCyclesView(): JSX.Element {
  const navigate = useNavigate()
  const { packs, cycles } = useUiStore()
  const [packModalOpen, setPackModalOpen] = useState(false)
  const [cycleModalOpen, setCycleModalOpen] = useState(false)

  const [packId, setPackId] = useState('')
  const [packName, setPackName] = useState('')
  const [packPosition, setPackPosition] = useState(0)
  const [editedCycleId, setEditedCycleId] = useState('')

  const [newCycleId, setNewCycleId] = useState('')
  const [cycleName, setCycleName] = useState('')
  const [cycleSize, setCycleSize] = useState(0)
  const [cyclePosition, setCyclePosition] = useState(0)

  const { enqueueSnackbar } = useSnackbar()
  const confirm = useConfirm()

  if (!packs || !cycles) {
    return <Loading />
  }

  const setPackIdAndName = (name: string) => {
    setPackId(toSlugId(name))
    setPackName(name)
  }

  const setCycleIdAndName = (name: string) => {
    setNewCycleId(toSlugId(name))
    setCycleName(name)
  }

  function packsForCycle(cycleId: string): Pack[] {
    return packs.filter((p) => p.cycle_id === cycleId)
  }

  function openPackModal(cycleId: string) {
    setPackId('')
    setPackName('')
    setPackPosition(0)
    setEditedCycleId(cycleId)
    setPackModalOpen(true)
  }

  function openCycleModal() {
    setNewCycleId('')
    setCycleName('')
    setCycleSize(0)
    setCyclePosition(0)
    setCycleModalOpen(true)
  }

  async function createPack() {
    const { confirmed } = await confirm({
      title: 'Create Pack',
      description: 'Do you really want to create this pack?',
      confirmationText: 'Create',
    })
    if (!confirmed) return
    privateApi.Pack.create({
      body: {
        cycle_id: editedCycleId,
        name: packName,
        id: packId,
        position: packPosition,
      },
    })
      .then(() => {
        window.location.reload()
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The pack couldn't be created!", { variant: 'error' })
      })
  }

  async function createCycle() {
    const { confirmed } = await confirm({
      title: 'Create Cycle',
      description: 'Do you really want to create this cycle?',
      confirmationText: 'Create',
    })
    if (!confirmed) return
    privateApi.Cycle.create({
      body: {
        id: newCycleId,
        name: cycleName,
        size: cycleSize,
        position: cyclePosition,
        publisher: 'emerald-legacy',
      },
    })
      .then(() => {
        window.location.reload()
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The cycle couldn't be created!", { variant: 'error' })
      })
  }

  async function confirmRotateCycle(cycleId: string) {
    const { confirmed } = await confirm({
      title: 'Confirm Rotation',
      description: 'Do you really want to rotate out this cycle?',
      confirmationText: 'Rotate Cycle',
    })
    if (!confirmed) return
    try {
      await privateApi.Cycle.rotate({ cycleId })
      window.location.reload()
    } catch (error) {
      console.log(error)
      enqueueSnackbar("The cycle couldn't be rotated!", { variant: 'error' })
    }
  }

  async function confirmRotatePack(packId: string) {
    const { confirmed } = await confirm({
      title: 'Confirm Rotation',
      description: 'Do you really want to rotate out this pack?',
      confirmationText: 'Rotate Pack',
    })
    if (!confirmed) return
    try {
      await privateApi.Pack.rotate({ packId })
      window.location.reload()
    } catch (error) {
      console.log(error)
      enqueueSnackbar("The pack couldn't be rotated!", { variant: 'error' })
    }
  }

  return (
    <Root>
      <Box sx={{ pb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4">Cycles</Typography>
              <Button
                variant="contained"
                color="secondary"
                size="medium"
                onClick={() => openCycleModal()}
              >
                Add Cycle
              </Button>
            </Box>
          </Grid>
          {cycles.map((cycle) => (
            <Grid size={6} key={cycle.id}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {cycle.rotated && (
                      <CachedIcon style={{ color: 'red', fontSize: 16, marginRight: 8 }} />
                    )}
                    {cycle.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => confirmRotateCycle(cycle.id)}
                    disabled={cycle.rotated}
                  >
                    Rotate Cycle
                  </Button>
                </Box>
                {packsForCycle(cycle.id).map((pack) => (
                  <Box
                    key={pack.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ ml: 4, mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}
                  >
                    <Typography variant="body2">
                      {pack.rotated && (
                        <CachedIcon style={{ color: 'red', fontSize: 14, marginRight: 8 }} />
                      )}
                      {pack.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => navigate(`/admin/pack/${pack.id}/edit`)}
                      >
                        Edit Pack
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => navigate(`/admin/pack/${pack.id}/cards`)}
                      >
                        Edit Pack Cards
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => confirmRotatePack(pack.id)}
                        disabled={pack.rotated}
                      >
                        Rotate Pack
                      </Button>
                    </Box>
                  </Box>
                ))}
                <Box sx={{ ml: 4, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => openPackModal(cycle.id)}
                  >
                    Add Pack
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Dialog open={packModalOpen} onClose={() => setPackModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Pack</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              value={packName}
              variant="outlined"
              onChange={(e) => setPackIdAndName(e.target.value)}
              label="Pack Name"
              size="small"
            />
            <Box padding={1.5} border="1px solid lightgray" borderRadius={1}>
              <Typography variant="body2">ID: {packId}</Typography>
            </Box>
            <TextField
              value={packPosition}
              variant="outlined"
              onChange={(e) => setPackPosition(Number.parseInt(e.target.value) || 0)}
              type="number"
              label="Pack Position"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPackModalOpen(false)} variant="outlined">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => createPack()}>
            Create Pack
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Cycle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              value={cycleName}
              variant="outlined"
              onChange={(e) => setCycleIdAndName(e.target.value)}
              label="Cycle Name"
              size="small"
            />
            <Box padding={1.5} border="1px solid lightgray" borderRadius={1}>
              <Typography variant="body2">ID: {newCycleId}</Typography>
            </Box>
            <TextField
              value={cycleSize}
              variant="outlined"
              onChange={(e) => setCycleSize(Number.parseInt(e.target.value) || 0)}
              type="number"
              label="Cycle Size"
              size="small"
            />
            <TextField
              value={cyclePosition}
              variant="outlined"
              onChange={(e) => setCyclePosition(Number.parseInt(e.target.value) || 0)}
              type="number"
              label="Cycle Position"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCycleModalOpen(false)} variant="outlined">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => createCycle()}>
            Create Cycle
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  )
}
