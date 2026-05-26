import { CardWithVersions } from '@5rdb/api'
import { factions } from '../utils/enums'
import { Box, Typography } from '@mui/material'
import { CardLink } from './card/CardLink'
import { getColorForFactionId } from '../utils/factionUtils'

import type { JSX } from 'react'

export function OrganizedPlayList(props: {
  cards: CardWithVersions[]
  title: string
  description: string
  format: string
}): JSX.Element {
  const cardsByFaction = factions
    .filter((faction) => faction.id !== 'shadowlands')
    .map((faction) => ({
      id: faction.id,
      name: faction.name,
      cards: props.cards.filter((c) => c.faction === faction.id),
    }))

  cardsByFaction.sort((a, b) => {
    if (a.id === 'neutral') {
      return -1
    }
    if (b.id === 'neutral') {
      return 1
    }
    return a.id.localeCompare(b.id)
  })

  return (
    <Box border="1px solid gray" borderRadius="4px" p={2}>
      <Typography>
        <b>{props.title}</b>
      </Typography>
      <Typography variant={'subtitle2'}>{props.description}</Typography>
      {cardsByFaction.map((cbf) => (
        <div key={cbf.id}>
          <Typography variant={'subtitle2'} style={{ color: getColorForFactionId(cbf.id) }}>
            <b>{cbf.name}</b>
          </Typography>
          <ul>
            {cbf.cards.map((card) => (
              <li key={card.id}>
                <CardLink cardId={card.id} format={props.format} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Box>
  )
}
