import { getDeck, getAllDecklistsForDeck, getDecklist } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Deck, Decks$find, DeckWithVersions } from '@5rdb/api'
import { addExtraInfoToDecklists } from './getDecklist'

export async function addDecklistsToDeck(deck: Deck): Promise<DeckWithVersions> {
  const decklists = await getAllDecklistsForDeck(deck.id)
  const forkedFrom = await getDecklist(deck.forked_from || '')
  return {
    ...deck,
    versions: await addExtraInfoToDecklists(decklists),
    forkedFrom: forkedFrom,
  }
}

export async function handler(
  req: Request<Decks$find['request']['params']>,
  res: Response<Decks$find['response']>
): Promise<DeckWithVersions | undefined> {
  const deck = await getDeck(req.params.deckId)
  if (!deck) {
    res.sendStatus(404)
    return
  }
  return await addDecklistsToDeck(deck)
}
