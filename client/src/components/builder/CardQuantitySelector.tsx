import { ButtonGroup, Button } from '@mui/material'

import { styled } from '@mui/material/styles'
import type { JSX } from 'react'
const PREFIX = 'CardQuantitySelector'

const classes = {
  buttonGroup: `${PREFIX}-buttonGroup`,
  buttonSelected: `${PREFIX}-buttonSelected`,
  buttonUnselected: `${PREFIX}-buttonUnselected`,
  button: `${PREFIX}-button`,
}

const StyledButtonGroup = styled(ButtonGroup)(() => ({
  [`&.${classes.buttonGroup}`]: {
    margin: 1,
  },

  [`& .${classes.buttonSelected}`]: {
    backgroundColor: 'gray',
    color: 'white',
    borderColor: 'gray',
  },

  [`& .${classes.buttonUnselected}`]: {
    backgroundColor: 'white',
    color: 'gray',
  },

  [`& .${classes.button}`]: {
    height: 24,
    width: 18,
    minWidth: 18,
    padding: 3,
  },
}))

export function CardQuantitySelector(props: {
  deckLimit: number
  quantity: number
  onQuantityChange: (newQuantity: number) => void
}): JSX.Element {
  const quantity = props.quantity

  function select(newQuantity: number) {
    props.onQuantityChange(newQuantity)
  }

  return (
    <StyledButtonGroup
      size="small"
      variant="outlined"
      color="inherit"
      className={classes.buttonGroup}
    >
      <Button
        disableTouchRipple
        className={`${classes.button} ${
          quantity === 0 ? classes.buttonSelected : classes.buttonUnselected
        }`}
        onClick={() => select(0)}
        variant="outlined"
      >
        0
      </Button>
      {props.deckLimit >= 1 && (
        <Button
          disableTouchRipple
          className={`${classes.button} ${
            quantity === 1 ? classes.buttonSelected : classes.buttonUnselected
          }`}
          onClick={() => select(1)}
          variant="outlined"
        >
          1
        </Button>
      )}
      {props.deckLimit >= 2 && (
        <Button
          disableTouchRipple
          className={`${classes.button} ${
            quantity === 2 ? classes.buttonSelected : classes.buttonUnselected
          }`}
          onClick={() => select(2)}
          variant="outlined"
        >
          2
        </Button>
      )}
      {props.deckLimit >= 3 && (
        <Button
          disableTouchRipple
          className={`${classes.button} ${
            quantity === 3 ? classes.buttonSelected : classes.buttonUnselected
          }`}
          onClick={() => select(3)}
          variant="outlined"
        >
          3
        </Button>
      )}
    </StyledButtonGroup>
  )
}
