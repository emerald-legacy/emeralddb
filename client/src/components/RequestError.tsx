import { Container } from '@mui/material'

import type { JSX } from 'react'

export function RequestError(props: { requestError: string }): JSX.Element {
  return (
    <Container>
      <h5>Error: {props.requestError}</h5>
    </Container>
  )
}
