import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { privateApi } from '../api'
import React, { useState, type JSX } from 'react'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useBetaEnvironment } from '../hooks/useBetaEnvironment'

export function AdminView(): JSX.Element {
  const navigate = useNavigate()
  const [packId, setPackId] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const [betaEnvironment] = useBetaEnvironment()

  if (betaEnvironment.loading) {
    return <Typography>Loading ...</Typography>
  }
  const betaUrl: string = betaEnvironment.data?.betaUrl || 'undefined'

  const importPack = () => {
    const enteredPackId = packId
    setPackId('')
    axios
      .get(`${betaUrl}api/packs/export/${enteredPackId}`)
      .then((exported) =>
        privateApi.Pack.import({
          body: {
            ...exported.data,
          },
        })
          .then(() => enqueueSnackbar('Successfully imported pack!', { variant: 'success' }))
          .catch(() => enqueueSnackbar("Couldn't import pack", { variant: 'error' }))
      )
      .catch(() => enqueueSnackbar("Couldn't import pack", { variant: 'error' }))
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin View
      </Typography>

      <Grid container spacing={3}>
        {/* Content Management Section */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Management
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/card/create/new')}
                    fullWidth
                  >
                    Create a New Card
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/admin/cycles')}
                    fullWidth
                  >
                    Manage Cycles And Packs
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/admin/traits')}
                    fullWidth
                  >
                    Manage Traits
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/admin/formats')}
                    fullWidth
                  >
                    Manage Formats
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Import Section */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Tools
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      value={packId}
                      onChange={(event) => setPackId(event.target.value)}
                      label="Pack ID"
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                    <Button
                      disabled={packId === ''}
                      variant="contained"
                      color="secondary"
                      onClick={importPack}
                      fullWidth
                    >
                      Import A Pack From BETA
                    </Button>
                  </Box>
                </Box>
                {/** Enable if you need local data */}
                <Button
                  disabled
                  variant="outlined"
                  color="secondary"
                  onClick={() => privateApi.Data.import()}
                  fullWidth
                >
                  Import Data (Disabled)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
