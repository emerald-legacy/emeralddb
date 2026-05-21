import { Container, Typography } from '@mui/material'

import type { JSX } from 'react'

export function Loading(): JSX.Element {
  return (
    <Container>
      <Typography variant="h5" align="center">
        Loading...
      </Typography>
    </Container>
  )
}
