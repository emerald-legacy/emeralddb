import DOMPurify from 'dompurify'
import { formatText } from '../../utils/cardTextUtils'

import type { JSX } from 'react'

// What card texts use (bold, emphasis, italics, line breaks) and the icons formatText adds
const ALLOWED_TAGS = ['b', 'em', 'i', 'br', 'span']
const ALLOWED_ATTR = ['class']

export function CardText(props: { text?: string }): JSX.Element {
  // Card texts come from the database and are imported from beta: anything else, such as
  // scripts, event handlers or links, is removed before the text becomes HTML
  const formattedText = props.text
    ? DOMPurify.sanitize(formatText(props.text), { ALLOWED_TAGS, ALLOWED_ATTR })
    : ''

  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />
}
