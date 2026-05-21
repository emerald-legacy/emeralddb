import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { Loading } from '../components/Loading'
import { useUiStore } from '../providers/UiStoreProvider'
import React, { useState, type JSX } from 'react'
import { Format } from '@5rdb/api'
import { privateApi } from '../api'
import { useSnackbar } from 'notistack'
import EditIcon from '@mui/icons-material/Edit'
import { CycleList } from '../components/CycleList'

export function EditFormatsView(): JSX.Element {
  const { formats, invalidateData } = useUiStore()
  const [formatId, setFormatId] = useState('')
  const [formatName, setFormatName] = useState('')
  const [legalPacks, setLegalPacks] = useState<string[]>([])
  const [isSupported, setIsSupported] = useState(false)
  const [position, setPosition] = useState(0)
  const [maintainer, setMaintainer] = useState('')
  const [description, setDescription] = useState('')
  const [infoLink, setInfoLink] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [packModalOpen, setPackModalOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  if (!formats) {
    return <Loading />
  }

  function openEditModal(format: Format) {
    setFormatId(format.id)
    setFormatName(format.name)
    setLegalPacks(format.legal_packs || [])
    setIsSupported(format.supported)
    setPosition(format.position)
    setMaintainer(format.maintainer || '')
    setDescription(format.description || '')
    setInfoLink(format.info_link || '')
    setModalOpen(true)
  }

  function openCreateModal() {
    setFormatId('')
    setFormatName('')
    setLegalPacks([])
    setIsSupported(false)
    setPosition(0)
    setMaintainer('')
    setDescription('')
    setInfoLink('')
    setModalOpen(true)
  }

  function saveFormat() {
    privateApi.Format.update({
      body: {
        format: {
          id: formatId,
          name: formatName,
          legal_packs: legalPacks,
          supported: isSupported,
          position: position,
          maintainer: maintainer || null,
          description: description || null,
          info_link: infoLink || null,
        },
      },
    })
      .then(() => {
        invalidateData()
        setFormatId('')
        setFormatName('')
        setLegalPacks([])
        setIsSupported(false)
        setPosition(0)
        setMaintainer('')
        setDescription('')
        setInfoLink('')
        setModalOpen(false)
        enqueueSnackbar('Successfully posted format!', { variant: 'success' })
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The format couldn't be posted!", { variant: 'error' })
      })
  }

  function compareFormats(a: Format, b: Format): number {
    return a.position - b.position || a.id.localeCompare(b.id)
  }

  const sortedFormats = formats.sort(compareFormats)

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 2, px: 1, pb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Formats</Typography>
                <Button variant="contained" color="secondary" onClick={() => openCreateModal()}>
                  Add New Format
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableCell>Position</TableCell>
                  <TableCell>Format ID</TableCell>
                  <TableCell>Format Display Name</TableCell>
                  <TableCell>Supported in Deckbuilding</TableCell>
                  <TableCell>Maintainer</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Info Link</TableCell>
                  <TableCell>Number of Legal Packs</TableCell>
                  <TableCell>Actions</TableCell>
                </TableHead>
                <TableBody>
                  {sortedFormats.map((format) => (
                    <TableRow key={format.id}>
                      <TableCell>{format.position}</TableCell>
                      <TableCell>{format.id}</TableCell>
                      <TableCell>{format.name}</TableCell>
                      <TableCell>{format.supported ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{format.maintainer || 'N/A'}</TableCell>
                      <TableCell>{format.description || 'N/A'}</TableCell>
                      <TableCell>
                        {format.info_link ? (
                          <a href={format.info_link}>{format.info_link}</a>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{format.legal_packs?.length || 0}</TableCell>
                      <TableCell>
                        <IconButton
                          color="secondary"
                          onClick={() => openEditModal(format)}
                          size="large"
                        >
                          <EditIcon />
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
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formatId === '' ? 'Create New Format' : 'Edit Format'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              value={position}
              variant="outlined"
              fullWidth
              onChange={(e) => setPosition(Number.parseInt(e.target.value))}
              label="Position"
              type="number"
              size="small"
            />
            <TextField
              value={formatId}
              variant="outlined"
              fullWidth
              onChange={(e) => setFormatId(e.target.value)}
              label="Format ID"
              size="small"
            />
            <TextField
              value={formatName}
              variant="outlined"
              fullWidth
              onChange={(e) => setFormatName(e.target.value)}
              label="Format Display Name"
              size="small"
            />
            <TextField
              value={maintainer}
              multiline
              rows={2}
              variant="outlined"
              fullWidth
              onChange={(e) => setMaintainer(e.target.value)}
              label="Maintainer"
              size="small"
            />
            <TextField
              value={description}
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              onChange={(e) => setDescription(e.target.value)}
              label="Description"
              size="small"
            />
            <TextField
              value={infoLink}
              variant="outlined"
              fullWidth
              onChange={(e) => setInfoLink(e.target.value)}
              label="Link for further information"
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSupported}
                  onChange={(value) => setIsSupported(value.target.checked)}
                />
              }
              label="Supported in Deckbuilding"
              labelPlacement="start"
            />
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => setPackModalOpen(true)}
            >
              Legal Packs
              {legalPacks.length > 0 && ` (Selected: ${legalPacks.length})`}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={() => saveFormat()}>
            Save Format
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={packModalOpen} onClose={() => setPackModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Legal Packs</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <CycleList
              withCheckbox
              rootLabel="All Packs"
              onSelection={(selectedPacks, _) => {
                setLegalPacks(selectedPacks)
              }}
              selectedPacks={legalPacks}
              selectedCycles={[]}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPackModalOpen(false)} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
