import { CardWithVersions } from '@5rdb/api'

/**
 * What a deck consists of, for showing it: its cards grouped by type, stronghold, role,
 * provinces, fate curve and clans. The rules (validity, influence, deck size limits) are
 * checked by the server: see useDeckValidation and POST /decklists/validate.
 */

export type CardWithQuantity = CardWithVersions & {
  quantity: number
}

type DynastyCards = {
  dynastyCharacters: CardWithQuantity[]
  dynastyEvents: CardWithQuantity[]
  holdings: CardWithQuantity[]
  size: number
}

type ConflictCards = {
  conflictCharacters: CardWithQuantity[]
  conflictEvents: CardWithQuantity[]
  attachments: CardWithQuantity[]
  size: number
}

export type DeckStatistics = {
  // A deck has one stronghold and at most one role; the server reports a deck with more
  stronghold: CardWithQuantity | null
  role: CardWithQuantity | null
  provinces: CardWithQuantity[]
  dynastyCards: DynastyCards
  conflictCards: ConflictCards
  dynastyFateCost: { [cost: string]: number }
  conflictFateCost: { [cost: string]: number }
  format: string
  primaryClan: string
  secondaryClan: string
}

type DeckCards = {
  stronghold: CardWithQuantity | null
  role: CardWithQuantity | null
  provinces: CardWithQuantity[]
  conflictCards: CardWithQuantity[]
  dynastyCards: CardWithQuantity[]
}

function extractPrimaryClan(
  format: string,
  stronghold: CardWithQuantity | null,
  dynastyCards: CardWithQuantity[]
): string {
  let primaryClan = ''
  if (format !== 'skirmish') {
    primaryClan = stronghold?.faction && stronghold.faction !== 'neutral' ? stronghold.faction : ''
  }
  if (primaryClan === '') {
    primaryClan = dynastyCards.filter((c) => c.faction !== 'neutral')[0]?.faction || ''
  }
  return primaryClan
}

function splitCardsToDecks(cards: Record<string, number>, allCards: CardWithVersions[]): DeckCards {
  let stronghold: CardWithQuantity | null = null
  let role: CardWithQuantity | null = null
  const provinces: CardWithQuantity[] = []
  const conflictCards: CardWithQuantity[] = []
  const dynastyCards: CardWithQuantity[] = []

  Object.entries(cards).forEach((record) => {
    const card = allCards.find((card) => record[0] === card.id)
    if (!card) {
      return
    }
    const cardWithQuantity: CardWithQuantity = { ...card, quantity: record[1] }
    if (cardWithQuantity.type === 'stronghold') {
      stronghold ??= cardWithQuantity
    }
    if (cardWithQuantity.type === 'province') {
      provinces.push(cardWithQuantity)
    }
    if (cardWithQuantity.type === 'role') {
      role ??= cardWithQuantity
    }
    if (cardWithQuantity.side === 'conflict') {
      conflictCards.push(cardWithQuantity)
    }
    if (cardWithQuantity.side === 'dynasty') {
      dynastyCards.push(cardWithQuantity)
    }
  })

  return {
    stronghold: stronghold,
    role: role,
    provinces: provinces,
    conflictCards: conflictCards,
    dynastyCards: dynastyCards,
  }
}

function splitConflictCards(cards: CardWithQuantity[]): ConflictCards {
  const conflictCharacters: CardWithQuantity[] = []
  const conflictEvents: CardWithQuantity[] = []
  const attachments: CardWithQuantity[] = []

  let size = 0
  cards.forEach((card) => {
    size += card.quantity
    if (card.type === 'character') {
      conflictCharacters.push(card)
    }
    if (card.type === 'event') {
      conflictEvents.push(card)
    }
    if (card.type === 'attachment') {
      attachments.push(card)
    }
  })

  return {
    conflictCharacters: conflictCharacters,
    conflictEvents: conflictEvents,
    attachments: attachments,
    size: size,
  }
}

function splitDynastyCards(cards: CardWithQuantity[]): DynastyCards {
  const dynastyCharacters: CardWithQuantity[] = []
  const dynastyEvents: CardWithQuantity[] = []
  const holdings: CardWithQuantity[] = []

  let size = 0
  cards.forEach((card) => {
    size += card.quantity
    if (card.type === 'character') {
      dynastyCharacters.push(card)
    }
    if (card.type === 'event') {
      dynastyEvents.push(card)
    }
    if (card.type === 'holding') {
      holdings.push(card)
    }
  })

  return {
    dynastyCharacters: dynastyCharacters,
    dynastyEvents: dynastyEvents,
    holdings: holdings,
    size: size,
  }
}

function fateCurve(cards: CardWithQuantity[]): { [cost: string]: number } {
  const fateCost: { [cost: string]: number } = {}
  cards.forEach((card) => {
    const cost = card.cost || 'X'
    fateCost[cost] = (fateCost[cost] ?? 0) + card.quantity
  })
  return fateCost
}

export function createDeckStatistics(
  cards: Record<string, number>,
  formatId: string,
  allCardsWithVersions: CardWithVersions[]
): DeckStatistics {
  const { stronghold, role, provinces, conflictCards, dynastyCards } = splitCardsToDecks(
    cards || {},
    allCardsWithVersions
  )
  const primaryClan = extractPrimaryClan(formatId, stronghold, dynastyCards)
  const secondaryClan =
    conflictCards.find((c) => c.faction !== primaryClan && c.faction !== 'neutral')?.faction || ''

  return {
    stronghold: stronghold,
    role: role,
    provinces: provinces,
    dynastyCards: splitDynastyCards(dynastyCards),
    conflictCards: splitConflictCards(conflictCards),
    dynastyFateCost: fateCurve(dynastyCards),
    conflictFateCost: fateCurve(conflictCards),
    format: formatId,
    primaryClan: primaryClan,
    secondaryClan: secondaryClan,
  }
}
