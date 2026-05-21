import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router'
import { Loading } from '../components/Loading'
import { useUiStore } from '../providers/UiStoreProvider'
import React, { useState, type JSX } from 'react'
import { Trait } from '@5rdb/api'
import { privateApi } from '../api'
import { useSnackbar } from 'notistack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export function EditTraitsView(): JSX.Element {
  const { traits, invalidateData } = useUiStore()
  const navigate = useNavigate()
  const [editIndex, setEditIndex] = useState(-1)
  const [traitId, setTraitId] = useState('')
  const [traitName, setTraitName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [traitToDelete, setTraitToDelete] = useState<Trait | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  if (!traits) {
    return <Loading />
  }

  function openEditModal(trait: Trait, index: number) {
    setEditIndex(index)
    setTraitId(trait.id)
    setTraitName(trait.name)
    setModalOpen(true)
  }

  function openCreateModal() {
    setEditIndex(-1)
    setTraitId('')
    setTraitName('')
    setModalOpen(true)
  }

  function saveTrait() {
    privateApi.Trait.update({
      body: {
        trait: { id: traitId, name: traitName },
      },
    })
      .then(() => {
        invalidateData()
        setModalOpen(false)
        enqueueSnackbar('Successfully posted trait!', { variant: 'success' })
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The trait couldn't be posted!", { variant: 'error' })
      })
  }

  function openDeleteDialog(trait: Trait) {
    setTraitToDelete(trait)
    setDeleteDialogOpen(true)
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false)
    setTraitToDelete(null)
  }

  async function confirmDeleteTrait() {
    if (!traitToDelete) return
    try {
      await privateApi.Trait.delete({
        body: {
          trait: traitToDelete,
        },
      })
      invalidateData()
      enqueueSnackbar('Successfully deleted trait!', { variant: 'success' })
      closeDeleteDialog()
    } catch (error) {
      console.log(error)
      enqueueSnackbar("The trait couldn't be deleted!", { variant: 'error' })
    }
  }

  const sortedTraits = traits.sort((a, b) => a.id.localeCompare(b.id))

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, px: 1, pb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Traits</Typography>
                <Button variant="contained" color="secondary" onClick={() => openCreateModal()}>
                  Add New Trait
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableCell>Trait ID</TableCell>
                  <TableCell>Trait Display Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableHead>
                <TableBody>
                  {sortedTraits.map((trait, index) => (
                    <TableRow key={trait.id}>
                      <TableCell>{trait.id}</TableCell>
                      <TableCell>{trait.name}</TableCell>
                      <TableCell>
                        <IconButton
                          color="secondary"
                          onClick={() => openEditModal(trait, index)}
                          size="large"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(trait)} size="large">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex === -1 ? 'Create New Trait' : 'Edit Trait'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              value={traitId}
              variant="outlined"
              fullWidth
              onChange={(e) => setTraitId(e.target.value)}
              label="Trait ID"
              size="small"
            />
            <TextField
              value={traitName}
              variant="outlined"
              fullWidth
              onChange={(e) => setTraitName(e.target.value)}
              label="Trait Display Name"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => saveTrait()}>
            Save Trait
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Do you really want to delete the trait "{traitToDelete?.name}" ({traitToDelete?.id})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button onClick={confirmDeleteTrait} variant="contained" color="error">
            Delete Trait
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
