import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import { styled } from '@mui/material/styles'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import { Button, ButtonGroup, Grid } from '@mui/material'

import type { JSX } from 'react'

const PREFIX = 'CardTextEditorButtons'

const classes = {
  buttonGroup: `${PREFIX}-buttonGroup`,
  icon: `${PREFIX}-icon`,
}

const StyledGrid = styled(Grid)(() => ({
  [`& .${classes.buttonGroup}`]: {
    height: 26,
    width: 26,
    marginBottom: 5,
  },

  [`& .${classes.icon}`]: {
    width: 26,
    height: 13,
  },
}))

export function CardTextEditorButtons(props: {
  onClick: (tagOrNameIcon: string, isIcon: boolean) => void
}): JSX.Element {
  const clickIcon = (iconName: string) => {
    props.onClick(iconName, true)
  }

  const clickTag = (tagName: string) => {
    props.onClick(tagName, false)
  }

  const getIconForIconName = (iconName: string): JSX.Element => {
    return <span className={`icon icon-${iconName} ${classes.icon}`}></span>
  }

  return (
    <StyledGrid container spacing={1} justifyContent="space-between">
      <Grid size={{ xs: 12, sm: 3 }}>
        <ButtonGroup variant="outlined" className={classes.buttonGroup}>
          <Button onClick={() => clickTag('br')}>
            <KeyboardReturnIcon />
          </Button>
          <Button onClick={() => clickTag('b')}>
            <FormatBoldIcon />
          </Button>
          <Button onClick={() => clickTag('em')}>
            <FormatItalicIcon />
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <ButtonGroup variant="outlined" className={classes.buttonGroup}>
          <Button onClick={() => clickIcon('element-air')}>
            {getIconForIconName('element-air')}
          </Button>
          <Button onClick={() => clickIcon('element-earth')}>
            {getIconForIconName('element-earth')}
          </Button>
          <Button onClick={() => clickIcon('element-fire')}>
            {getIconForIconName('element-fire')}
          </Button>
          <Button onClick={() => clickIcon('element-water')}>
            {getIconForIconName('element-water')}
          </Button>
          <Button onClick={() => clickIcon('element-void')}>
            {getIconForIconName('element-void')}
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <ButtonGroup variant="outlined" className={classes.buttonGroup}>
          <Button onClick={() => clickIcon('conflict-military')}>
            {getIconForIconName('conflict-military')}
          </Button>
          <Button onClick={() => clickIcon('conflict-political')}>
            {getIconForIconName('conflict-political')}
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <ButtonGroup variant="outlined" className={classes.buttonGroup}>
          <Button onClick={() => clickIcon('clan-crab')}>{getIconForIconName('clan-crab')}</Button>
          <Button onClick={() => clickIcon('clan-crane')}>
            {getIconForIconName('clan-crane')}
          </Button>
          <Button onClick={() => clickIcon('clan-dragon')}>
            {getIconForIconName('clan-dragon')}
          </Button>
          <Button onClick={() => clickIcon('clan-lion')}>{getIconForIconName('clan-lion')}</Button>
          <Button onClick={() => clickIcon('clan-phoenix')}>
            {getIconForIconName('clan-phoenix')}
          </Button>
          <Button onClick={() => clickIcon('clan-scorpion')}>
            {getIconForIconName('clan-scorpion')}
          </Button>
          <Button onClick={() => clickIcon('clan-unicorn')}>
            {getIconForIconName('clan-unicorn')}
          </Button>
          <Button onClick={() => clickIcon('clan-shadowlands')}>
            {getIconForIconName('clan-shadowlands')}
          </Button>
        </ButtonGroup>
      </Grid>
    </StyledGrid>
  )
}
