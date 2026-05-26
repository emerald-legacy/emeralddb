import {
  getDeck,
  getAllDecklistsForDeck,
  getDecklist,
  getUser,
  getCards,
} from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$find, DecklistWithUser, DecklistWithExtraInfo } from '@5rdb/api'

export async function addUsernameToDecklist(decklist: Decklist): Promise<DecklistWithUser> {
  const user = await getUser(decklist.user_id)
  return { ...decklist, username: user.name }
}

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
  return addUsernameToDecklist(decklist)
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
