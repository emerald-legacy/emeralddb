import { CardWithVersions, Format } from '@5rdb/api'
import uniq from 'lodash/uniq'

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
  maxInfluence: number
  usedInfluence: number
  stronghold: CardWithQuantity | null
  role: CardWithQuantity | null
  strongholds: CardWithQuantity[]
  roles: CardWithQuantity[]
  provinces: CardWithQuantity[]
  dynastyCards: DynastyCards
  conflictCards: ConflictCards
  dynastyFateCost: { [cost: string]: number }
  conflictFateCost: { [cost: string]: number }
  bannedCards: CardWithQuantity[]
  restrictedCards: CardWithQuantity[]
  rotatedCards: CardWithQuantity[]
  isSeeker: boolean
  roleElements: string[]
  deckMaximum: number
  conflictDeckMinimum: number
  dynastyDeckMinimum: number
  numberOfRallyCards: number
  format: string
  primaryClan: string
  secondaryClan: string
  validationErrors: string[]
}

type DeckCards = {
  strongholds: CardWithQuantity[]
  roles: CardWithQuantity[]
  provinces: CardWithQuantity[]
  conflictCards: CardWithQuantity[]
  dynastyCards: CardWithQuantity[]
  allDeckCards: CardWithQuantity[]
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
  const strongholds: CardWithQuantity[] = []
  const roles: CardWithQuantity[] = []
  const provinces: CardWithQuantity[] = []
  const conflictCards: CardWithQuantity[] = []
  const dynastyCards: CardWithQuantity[] = []
  const allDeckCards: CardWithQuantity[] = []

  Object.entries(cards).forEach((record) => {
    const card = allCards.find((card) => record[0] === card.id)
    if (!card) {
      return
    }
    const cardWithQuantity: CardWithQuantity = { ...card, quantity: record[1] }
    allDeckCards.push(cardWithQuantity)
    if (cardWithQuantity.type === 'stronghold') {
      strongholds.push(cardWithQuantity)
    }
    if (cardWithQuantity.type === 'province') {
      provinces.push(cardWithQuantity)
    }
    if (cardWithQuantity.type === 'role') {
      roles.push(cardWithQuantity)
    }
    if (cardWithQuantity.side === 'conflict') {
      conflictCards.push(cardWithQuantity)
    }
    if (cardWithQuantity.side === 'dynasty') {
      dynastyCards.push(cardWithQuantity)
    }
  })

  return {
    strongholds: strongholds,
    roles: roles,
    provinces: provinces,
    conflictCards: conflictCards,
    dynastyCards: dynastyCards,
    allDeckCards: allDeckCards,
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

function validateDecklist(
  stats: DeckStatistics,
  allDeckCards: CardWithQuantity[],
  dynastyCards: CardWithQuantity[],
  conflictCards: CardWithQuantity[]
): string[] {
  const validationErrors: string[] = []
  allDeckCards
    .filter((c) => c.role_restrictions.length > 0)
    .forEach((c) => {
      if (!stats.roleElements.some((element) => c.role_restrictions.includes(element))) {
        validationErrors.push(`'${c.name}' requires a different role.`)
      }
    })
  if (
    uniq(allDeckCards.map((c) => c.faction)).some(
      (faction) =>
        faction !== 'neutral' && faction !== stats.primaryClan && faction !== stats.secondaryClan
    )
  ) {
    validationErrors.push(`Too many splash clans.`)
  }
  if (stats.bannedCards.length > 0) {
    validationErrors.push(
      `The deck contains banned cards: ${stats.bannedCards.map((c) => c.name).join(', ')}`
    )
  }
  if (stats.restrictedCards.length > 1) {
    validationErrors.push(
      `The deck contains more than one restricted card: ${stats.restrictedCards
        .map((c) => c.name)
        .join(', ')}`
    )
  }
  if (stats.rotatedCards.length > 0) {
    validationErrors.push(
      `The deck contains cards from packs that aren't legal in the format: ${stats.rotatedCards
        .map((c) => c.name)
        .join(', ')}`
    )
  }
  const unallowedClans = allDeckCards.filter(
    (c) => !c.allowed_clans || !c.allowed_clans.includes(stats.primaryClan)
  )
  if (unallowedClans.length > 0) {
    validationErrors.push(
      `The deck contains cards that are not allowed in that clan: ${unallowedClans
        .map((c) => c.name)
        .join(', ')}`
    )
  }
  if (
    stats.dynastyCards.size < stats.dynastyDeckMinimum ||
    stats.dynastyCards.size > stats.deckMaximum
  ) {
    validationErrors.push(
      `The dynasty deck must contain between ${stats.dynastyDeckMinimum} and ${stats.deckMaximum} cards.`
    )
  }
  if (
    stats.conflictCards.size < stats.conflictDeckMinimum ||
    stats.conflictCards.size > stats.deckMaximum
  ) {
    validationErrors.push(
      `The conflict deck must contain between ${stats.conflictDeckMinimum} and ${stats.deckMaximum} cards.`
    )
  }

  if (stats.usedInfluence > stats.maxInfluence) {
    validationErrors.push(`The conflict deck uses too much influence.`)
  }

  if (stats.format === 'emerald') {
    if (stats.numberOfRallyCards > 5) {
      validationErrors.push(`The deck contains more than 5 Rally cards.`)
    }
    const splashBannedCards = conflictCards.filter(
      (c) => c.splash_banned_in && c.splash_banned_in.length > 0 && c.faction !== stats.primaryClan
    )
    if (splashBannedCards.length > 0) {
      validationErrors.push(
        `The deck contains splash banned cards: ${splashBannedCards.map((c) => c.name).join(', ')}`
      )
    }
  }

  if (stats.format === 'skirmish') {
    if (stats.provinces.length > 0) {
      validationErrors.push(`Roles are not allowed in Skirmish Format.`)
    }
    if (stats.strongholds.length > 0) {
      validationErrors.push(`Strongholds are not allowed in Skirmish Format.`)
    }
    if (stats.roles.length > 0) {
      validationErrors.push(`Roles are not allowed in Skirmish Format.`)
    }
  } else {
    if (stats.provinces.length !== 5) {
      validationErrors.push(`A deck must contain exactly 5 provinces.`)
    }
    if (stats.strongholds.length !== 1) {
      validationErrors.push(`A deck must contain exactly 1 stronghold.`)
    }
    if (stats.roles.length > 1) {
      validationErrors.push(`A deck may contain only 1 role.`)
    }
    const singleElementProvinces = stats.provinces.filter(
      (c) => c.elements && c.elements.length === 1
    )
    const multipleElementProvinces = stats.provinces.filter(
      (c) => c.elements && c.elements.length > 1
    )

    let permutations = [singleElementProvinces.map((province) => province.elements![0])]

    multipleElementProvinces.forEach((p) => {
      const newPermutations: string[][] = []
      p.elements!.forEach((element) => {
        permutations.forEach((permutation) => {
          const newPermutation = [...permutation]
          newPermutation.push(element)
          newPermutations.push(newPermutation)
        })
      })
      permutations = [...newPermutations]
    })

    let legal = false

    for (const permutation of permutations) {
      const uniqueElements = uniq(permutation)
      if (uniqueElements.length === 5) {
        legal = true
      } else if (
        stats.isSeeker &&
        uniqueElements.length === 4 &&
        permutation.filter((element) => stats.roleElements.some((elem) => elem === element))
          .length === 2
      ) {
        legal = true
      }
    }
    if (!legal && stats.provinces.length === 5) {
      validationErrors.push(`The chosen provinces do not cover the needed elements.`)
    }
  }
  return validationErrors
}

export function createDeckStatistics(
  cards: Record<string, number>,
  formatId: string,
  allCardsWithVersions: CardWithVersions[],
  formats: Format[]
): DeckStatistics {
  const format = formats.find((f) => f.id === formatId)
  const { strongholds, provinces, roles, conflictCards, dynastyCards, allDeckCards } =
    splitCardsToDecks(cards || {}, allCardsWithVersions)
  const allIllegalCardIds = allCardsWithVersions
    .filter((c) => !c.versions.some((v) => (format?.legal_packs || []).includes(v.pack_id)))
    .map((c) => c.id)
  const allRotatedCardIds = allCardsWithVersions
    .filter((c) => !c.versions.some((v) => !v.rotated))
    .map((c) => c.id)
  const dynastyCardsWrapper = splitDynastyCards(dynastyCards)
  const conflictCardsWrapper = splitConflictCards(conflictCards)
  const dynastyFateCost: { [cost: string]: number } = {}
  dynastyCards.forEach((card) => {
    const cost = card.cost || 'X'
    if (dynastyFateCost[cost]) {
      dynastyFateCost[cost] += card.quantity
    } else {
      dynastyFateCost[cost] = card.quantity
    }
  })

  const conflictFateCost: { [cost: string]: number } = {}
  conflictCards.forEach((card) => {
    const cost = card.cost || 'X'
    if (conflictFateCost[cost]) {
      conflictFateCost[cost] += card.quantity
    } else {
      conflictFateCost[cost] = card.quantity
    }
  })
  const stronghold = strongholds.length > 0 ? strongholds[0] : null
  const role = roles.length > 0 ? roles[0] : null
  const baseInfluence = formatId === 'skirmish' ? 6 : (stronghold?.influence_pool ?? 0)
  const extraInfluenceFromRole = role
    ? role.id.includes('support')
      ? 8
      : role.id.includes('keeper')
        ? 3
        : 0
    : 0
  const extraInfluenceFromCards = cardsThatModifyInfluence
    .filter((card) => cards[card.id] && cards[card.id] > 0)
    .map((card) => card.modifier * cards[card.id])
    .reduce((a, b) => a + b, 0)
  const maxInfluence = baseInfluence + extraInfluenceFromRole + extraInfluenceFromCards
  const roleElements =
    role?.traits?.filter((trait) =>
      ['air', 'earth', 'fire', 'water', 'void', 'seeker', 'keeper'].includes(trait)
    ) || []
  const isSeeker = role?.traits?.some((trait) => trait === 'seeker') || false
  const numberOfRallyCards = dynastyCards
    .filter((c) => c.text?.includes('Rally.'))
    .map((c) => c.quantity)
    .reduce((a, b) => a + b, 0)
  const primaryClan = extractPrimaryClan(formatId, stronghold, dynastyCards)
  const secondaryClan =
    conflictCards.find((c) => c.faction !== primaryClan && c.faction !== 'neutral')?.faction || ''
  const usedInfluence = conflictCards
    .filter((c) => c.faction !== primaryClan)
    .map((c) => (c.influence_cost || 0) * c.quantity)
    .reduce((a, b) => a + b, 0)
  const bannedCards = allDeckCards.filter((c) => c.banned_in?.includes(formatId))
  const restrictedCards = allDeckCards.filter((c) => c.restricted_in?.includes(formatId))
  const illegalCards = allDeckCards.filter((c) => allIllegalCardIds.includes(c.id))
  const rotatedCards = allDeckCards.filter((c) => allRotatedCardIds.includes(c.id))

  const deckMaximum =
    formatId === 'skirmish' ? 35 : formatId === 'obsidian' ? 45 + numberOfRallyCards : 45
  const deckMinimum = formatId === 'skirmish' ? 30 : 40
  const dynastyDeckMinimum =
    formatId === 'emerald' || formatId === 'obsidian'
      ? deckMinimum + numberOfRallyCards
      : deckMinimum

  // @ts-ignore
  const stats: DeckStatistics = {
    maxInfluence: maxInfluence,
    usedInfluence: usedInfluence,
    stronghold: stronghold,
    role: role,
    strongholds: strongholds,
    roles: roles,
    provinces: provinces,
    dynastyCards: dynastyCardsWrapper,
    conflictCards: conflictCardsWrapper,
    dynastyFateCost: dynastyFateCost,
    conflictFateCost: conflictFateCost,
    isSeeker: isSeeker,
    roleElements: roleElements,
    deckMaximum: deckMaximum,
    conflictDeckMinimum: deckMinimum,
    dynastyDeckMinimum: dynastyDeckMinimum,
    numberOfRallyCards: numberOfRallyCards,
    format: formatId,
    primaryClan: primaryClan,
    secondaryClan: secondaryClan,
    bannedCards: bannedCards,
    restrictedCards: restrictedCards,
    rotatedCards: formatId === 'emerald' ? uniq([...illegalCards, ...rotatedCards]) : illegalCards,
    validationErrors: [],
  }

  stats.validationErrors = validateDecklist(stats, allDeckCards, dynastyCards, conflictCards)

  return stats
}

export const cardsThatModifyInfluence: { id: string; modifier: number }[] = [
  { id: 'yatakabune-port', modifier: 4 },
]
