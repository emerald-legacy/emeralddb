import { getDecksForOwner } from '../gateways/storage/index'
import { Request } from 'express'
import { Decks$findForUser } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'
import { addDecklistsToDeck } from './getDeck'

export async function handler(req: Request): Promise<Decks$findForUser['response']> {
  const decks = await getDecksForOwner((await requireCurrentUser(req)).public_id)
  return await Promise.all(decks.map(async (deck) => await addDecklistsToDeck(deck)))
}
