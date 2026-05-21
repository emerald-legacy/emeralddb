import Fuse from 'fuse.js'
import { getAllCards, getAllCardsInPacks } from '../../gateways/storage'
import { CardInput, CardPackInput } from './types'

interface Card {
  id: string
  image: string
  name: string
}
type Registry = Map<Card['name'], Card>

type NameFuzzySearch = Fuse<Card['name']>

interface Cache {
  registry: Registry
  fuzzy: NameFuzzySearch
  expiresAt: number
}

const cache: Cache = {
  registry: new Map(),
  expiresAt: 0, // Initialize the cache as expired
  fuzzy: new Fuse([], { isCaseSensitive: false, includeScore: true, ignoreLocation: true }),
}

const fiveMinutesFromNow = () => Date.now() + 1000 * 60 * 5

const idAndImageSkippingWhenImageIsMissing = (card: CardPackInput): [string, string][] => {
  if (typeof card.image_url !== 'string') {
    return []
  }
  return [[card.card_id, card.image_url]]
}

const versionNumberRegex = /\((\d+)\)/ // Matches `(2)`, `(42)`, etc
const extendedName = (card: CardInput) => {
  if (!card.name_extra) {
    return card.name
  }

  const match = versionNumberRegex.exec(card.name_extra)
  if (match === null) {
    return `${card.name} - ${card.name_extra}`
  }

  const [, versionNumber] = match
  return `${card.name} ${versionNumber}`
}

const nameAndImageSkippingWhenImageIsMissing =
  (images: Map<string, string>) =>
  (card: CardInput): [string, Card][] => {
    const image = images.get(card.id)
    if (typeof image !== 'string') {
      return []
    }

    return [[extendedName(card), { image, id: card.id, name: card.name }]]
  }

// ---------
// REGISTRY
// ---------
async function buildRegistry(): Promise<Registry> {
  const [cards, allCardsInPacks] = await Promise.all([getAllCards(), getAllCardsInPacks()])

  // Pre-group by ID to keep this function as O(2n) instead of O(n2)
  const images = new Map(allCardsInPacks.flatMap(idAndImageSkippingWhenImageIsMissing))

  return new Map(cards.flatMap(nameAndImageSkippingWhenImageIsMissing(images)))
}

export async function fetchValidCache(): Promise<Cache> {
  if (cache.expiresAt > Date.now()) {
    return cache
  }

  cache.registry = await buildRegistry()
  cache.expiresAt = fiveMinutesFromNow()
  cache.fuzzy.setCollection(Array.from(cache.registry.keys()))

  return cache
}
