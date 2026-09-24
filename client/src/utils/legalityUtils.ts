import { CardWithVersions, Format } from '@5rdb/api'

export type Legality = 'legal' | 'restricted' | 'banned' | 'rotated' | 'not-legal'

// A card is in a format's pool if any of its printings is in a legal pack.
// Rotation only applies to the Emerald Legacy format.
export function isInCardPool(card: CardWithVersions, format: Format): boolean {
  const legalPacks = format.legal_packs || []
  return card.versions.some(
    (version) =>
      legalPacks.includes(version.pack_id) && (format.id !== 'emerald' || !version.rotated)
  )
}

export function getCardLegality(card: CardWithVersions, format: Format): Legality {
  if (!isInCardPool(card, format)) {
    const isRotated = format.id === 'emerald' && card.versions.some((version) => version.rotated)
    return isRotated ? 'rotated' : 'not-legal'
  }
  if (card.banned_in?.includes(format.id)) {
    return 'banned'
  }
  if (card.restricted_in?.includes(format.id)) {
    return 'restricted'
  }
  return 'legal'
}

// Legality of a card in each of the given formats, in the formats' display order
export function getFormatLegalities(
  card: CardWithVersions,
  formats: Format[]
): { format: Format; legality: Legality }[] {
  return [...formats]
    .sort((a, b) => a.position - b.position)
    .map((format) => ({ format, legality: getCardLegality(card, format) }))
}
