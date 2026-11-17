import { getDecksForUser } from '../gateways/storage/index'
import { Request } from 'express'
import { Decks$findForUser } from '@5rdb/api'
import { getUserId } from '../utils/getUserId'
import { addDecklistsToDeck } from './getDeck'

export async function handler(req: Request): Promise<Decks$findForUser['response']> {
  const decks = await getDecksForUser(getUserId(req))
  return await Promise.all(decks.map(async (deck) => await addDecklistsToDeck(deck)))
}
