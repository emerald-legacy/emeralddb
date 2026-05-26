import { factions } from '../../utils/enums'
import { getColorForFactionId } from '../../utils/factionUtils'

import type { JSX } from 'react'

export function CardFactionIcon(props: { faction?: string; colored?: boolean }): JSX.Element {
  if (!factions.some((faction) => faction.id === props.faction)) {
    return <span />
  }
  return (
    <span
      style={{ color: props.colored ? getColorForFactionId(props.faction || '') : 'inherit' }}
      className={`icon icon-clan-${props.faction}`}
    />
  )
}
