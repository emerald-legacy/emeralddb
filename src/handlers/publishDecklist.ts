import { getDecklist, publishDecklist } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$publish } from '@5rdb/api'
import { isDeckValid } from './validators/deckValidator'
import { getUserId } from '../utils/getUserId'

export async function handler(
  req: Request<Decklists$publish['request']['params']>,
  res: Response
): Promise<Decklist | undefined> {
  const decklist = await getDecklist(req.params.decklistId)
  if (!decklist) {
    res.sendStatus(404)
    return
  }
  const userId = getUserId(req)
  if (userId !== decklist.user_id) {
    res.sendStatus(403)
    return
  }
  const { valid } = await isDeckValid(decklist.cards, decklist.format)
  if (!valid) {
    res.status(400).send('Deck has validation errors')
  } else {
    console.log(`Publish decklist ${decklist.id} for user ${userId}!`)
    const published = await publishDecklist(req.params.decklistId)
    if (!published) {
      res.sendStatus(404)
    }
    return published
  }
}
