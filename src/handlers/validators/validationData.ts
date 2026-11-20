import { CardWithVersions, Format } from '@5rdb/api'
import { getAllCards, getAllCardsInPacks, getAllFormats } from '../../gateways/storage/index'

/**
 * What deck validation needs from the database: every card with its printings, all formats.
 * Shared by all requests, so read-only.
 */
export interface ValidationData {
  readonly cards: readonly CardWithVersions[]
  readonly formats: readonly Format[]
}

/**
 * Each server process keeps its own copy. Writes clear it in this process (see
 * middlewares/clearValidationData.ts); the maximum age bounds how long another process
 * can validate against old data.
 */
export const FIVE_MINUTES = 5 * 60 * 1000

let cached: { data: Promise<ValidationData>; expiresAt: number } | undefined

async function load(): Promise<ValidationData> {
  const [cards, cardsInPacks, formats] = await Promise.all([
    getAllCards(),
    getAllCardsInPacks(),
    getAllFormats(),
  ])
  const printingsByCard = new Map<string, CardWithVersions['versions']>()
  for (const cardInPack of cardsInPacks) {
    const printings = printingsByCard.get(cardInPack.card_id) ?? []
    printings.push(cardInPack)
    printingsByCard.set(cardInPack.card_id, printings)
  }
  return {
    cards: cards.map((card) => ({ ...card, versions: printingsByCard.get(card.id) ?? [] })),
    formats,
  }
}

/** The cached data, loaded on first use; parallel callers share one load */
export function getValidationData(): Promise<ValidationData> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }
  const data = load()
  cached = { data, expiresAt: Date.now() + FIVE_MINUTES }
  // A failed load must not be cached
  data.catch(() => {
    if (cached?.data === data) {
      cached = undefined
    }
  })
  return data
}

/** Call after cards, printings, packs or formats changed */
export function clearValidationData(): void {
  cached = undefined
}
