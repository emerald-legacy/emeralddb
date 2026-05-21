import { formatText } from '../../utils/cardTextUtils'

import type { JSX } from 'react'

export function CardText(props: { text?: string }): JSX.Element {
  const formattedText = props.text ? formatText(props.text) : ''

  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />
}
