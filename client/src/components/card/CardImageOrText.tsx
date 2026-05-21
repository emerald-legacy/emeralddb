import { Fab } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useUiStore } from '../../providers/UiStoreProvider'
import { CardInformation } from './CardInformation'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import { CardInPack } from '@5rdb/api'
import { getImageUrl } from '../../utils/imageUrl'

import type { JSX } from 'react'

const PREFIX = 'CardImageOrText'

const classes = {
  fab: `${PREFIX}-fab`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.fab}`]: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(0.5),
  },
}))

export function CardImageOrText(props: {
  cardId: string
  onClick?: (id: string) => void
  cardVersion: Omit<CardInPack, 'card_id'> | undefined
  showFab?: boolean
}): JSX.Element {
  const { cards } = useUiStore()

  const card = cards.find((card) => card.id === props.cardId)
  if (!card) {
    return <span>Unknown Card ID</span>
  }

  const cardVersion = props.cardVersion || card.versions[0]
  const cardImage = cardVersion && cardVersion.image_url
  const showFab = props.showFab !== false // Default to true if not specified

  const handleClick = () => {
    if (props.onClick) {
      props.onClick(props.cardId)
    }
  }

  return (
    <Root style={{ position: 'relative', height: '95%' }}>
      {cardImage ? (
        <img src={getImageUrl(cardImage)} style={{ maxWidth: '100%', height: 'auto' }} />
      ) : (
        <CardInformation cardWithVersions={card} currentVersion={cardVersion} />
      )}
      {showFab && (
        <Fab className={classes.fab} color={'secondary'} size="small" onClick={handleClick}>
          <ZoomInIcon />
        </Fab>
      )}
    </Root>
  )
}
