import { getColorForFactionId } from '../../utils/factionUtils'

import type { JSX } from 'react'

export function InfluenceElement(props: { faction: string; influence: number }): JSX.Element {
  if (props.faction === 'shadowlands' || props.faction === 'neutral' || props.influence < 0) {
    return <span></span>
  }
  const color = getColorForFactionId(props.faction)
  const textChildren: JSX.Element[] = []

  const fullBlocks = props.influence / 5
  for (let i = 1; i < fullBlocks; i++) {
    textChildren.push(<span style={{ textDecoration: 'line-through' }}>{'////'}</span>)
  }
  let leftOverString = ''
  const leftOver = props.influence % 5
  for (let i = 0; i < leftOver; i++) {
    leftOverString += '/'
  }
  textChildren.push(<span>{leftOverString}</span>)
  return (
    <span style={{ color: color || 'black' }}>
      <b>
        {textChildren.map((child, idx) => (
          <span key={idx}>{child} </span>
        ))}
      </b>
    </span>
  )
}
