import { Button, ButtonGroup, Grid, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState, type JSX } from 'react'

const PREFIX = 'CardValueFilter'

const classes = {
  buttonGroup: `${PREFIX}-buttonGroup`,
  button: `${PREFIX}-button`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.button}`]: {
    height: 24,
    width: 24,
    minWidth: '24px !important',
    padding: 2,
  },
}))

export enum ValueFilterType {
  GREATER,
  EQUAL,
  LOWER,
}

export function CardValueFilter(props: {
  valueLabel: JSX.Element
  onFilterChange: (type: ValueFilterType, value: string) => void
}): JSX.Element {
  const [filterType, setFilterType] = useState<ValueFilterType>(ValueFilterType.EQUAL)
  const [filterString, setFilterString] = useState('')

  useEffect(() => props.onFilterChange(filterType, filterString), [filterType, filterString])

  return (
    <StyledGrid container alignItems="center" spacing={1}>
      <Grid sx={{ width: 44, flexShrink: 0 }}>{props.valueLabel}</Grid>
      <Grid sx={{ flexShrink: 0 }}>
        <ButtonGroup size="small" className={classes.buttonGroup} variant="contained">
          <Button
            className={classes.button}
            onClick={() => setFilterType(ValueFilterType.GREATER)}
            color={filterType === ValueFilterType.GREATER ? 'secondary' : 'inherit'}
          >
            {'>'}
          </Button>
          <Button
            className={classes.button}
            onClick={() => setFilterType(ValueFilterType.EQUAL)}
            color={filterType === ValueFilterType.EQUAL ? 'secondary' : 'inherit'}
          >
            {'='}
          </Button>
          <Button
            className={classes.button}
            onClick={() => setFilterType(ValueFilterType.LOWER)}
            color={filterType === ValueFilterType.LOWER ? 'secondary' : 'inherit'}
          >
            {'<'}
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid sx={{ flex: 1, maxWidth: 60, marginLeft: '8px', marginRight: '8px' }}>
        <TextField
          value={filterString}
          onChange={(e) => setFilterString(e.target.value)}
          variant="standard"
          fullWidth
        />
      </Grid>
    </StyledGrid>
  )
}
