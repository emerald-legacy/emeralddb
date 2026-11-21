import { getDeck, getAllDecklistsForDeck, getDecklist, getCards } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$find, DecklistWithUser, DecklistWithExtraInfo } from '@5rdb/api'
import { withUsername } from '../utils/withUsernames'

export async function handler(
  req: Request<Decklists$find['request']['params']>,
  res: Response<Decklists$find['response']>
): Promise<DecklistWithUser | undefined> {
  let decklist = await getDecklist(req.params.decklistId)
  if (!decklist) {
    const deck = await getDeck(req.params.decklistId)
    if (!deck) {
      res.sendStatus(404)
      return
    }
    const allDecklistsForDeck = await getAllDecklistsForDeck(deck.id)
    if (!allDecklistsForDeck || allDecklistsForDeck.length === 0) {
      res.sendStatus(404)
      return
    }
    decklist = allDecklistsForDeck.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }
  return withUsername(decklist, 'owner_id')
}

/** Adds the stronghold and role to each decklist, with one query for all of them */
export async function addExtraInfoToDecklists(
  decklists: Decklist[]
): Promise<DecklistWithExtraInfo[]> {
  const cardIds = new Set(decklists.flatMap((decklist) => Object.keys(decklist.cards)))
  if (cardIds.size === 0) {
    return decklists
  }
  const keyCards = (await getCards([...cardIds])).filter(
    (card) => card.type === 'stronghold' || card.type === 'role'
  )
  return decklists.map((decklist) => {
    const keyCardsInDeck = keyCards.filter((card) => decklist.cards[card.id])
    return {
      ...decklist,
      stronghold: keyCardsInDeck.find((card) => card.type === 'stronghold'),
      role: keyCardsInDeck.find((card) => card.type === 'role'),
    }
  })
}
