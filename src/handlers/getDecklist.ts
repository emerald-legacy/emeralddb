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

export async function addExtraInfoToDecklist(decklist: Decklist): Promise<DecklistWithExtraInfo> {
  const cardIds = Object.keys(decklist.cards)
  const cards = await getCards(cardIds)
  const stronghold = cards.find((card) => card.type === 'stronghold')
  const role = cards.find((card) => card.type === 'role')

  return {
    ...decklist,
    stronghold,
    role,
  }
}
