import { getAllPublishedDecklists, getCardsOfTypes } from '../gateways/storage/index'
import { CardReference, PublishedDecklistWithExtraInfo } from '@5rdb/api'
import { withUsernames } from '../utils/withUsernames'

function toReference(card: CardReference | undefined): CardReference | undefined {
  return card && { id: card.id, name: card.name }
}

/**
 * The public deck list. Each decklist is a summary without its cards; GET /decklists/:id
 * has the full decklist. The fields are picked one by one, so a new column never shows
 * up here by accident.
 */
export async function handler(): Promise<PublishedDecklistWithExtraInfo[]> {
  const decklists = await withUsernames(await getAllPublishedDecklists(), 'owner_id')
  // The strongholds and roles of all decklists, with one query
  const keyCards = await getCardsOfTypes(
    decklists.flatMap((decklist) => Object.keys(decklist.cards)),
    ['stronghold', 'role']
  )
  const keyCardsById = new Map(keyCards.map((card) => [card.id, card]))

  return decklists.map((decklist) => {
    const keyCardsInDeck = Object.keys(decklist.cards).flatMap(
      (cardId) => keyCardsById.get(cardId) ?? []
    )
    return {
      id: decklist.id,
      name: decklist.name,
      version_number: decklist.version_number,
      format: decklist.format,
      primary_clan: decklist.primary_clan,
      secondary_clan: decklist.secondary_clan,
      published_date: decklist.published_date,
      username: decklist.username,
      stronghold: toReference(keyCardsInDeck.find((card) => card.type === 'stronghold')),
      role: toReference(keyCardsInDeck.find((card) => card.type === 'role')),
    }
  })
}
