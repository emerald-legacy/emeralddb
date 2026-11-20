import { getDecklist, publishDecklist } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$publish } from '@5rdb/api'
import { validateDeck } from './validators/deckValidator'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(
  req: Request<Decklists$publish['request']['params']>,
  res: Response
): Promise<Decklist | undefined> {
  const decklist = await getDecklist(req.params.decklistId)
  if (!decklist) {
    res.sendStatus(404)
    return
  }
  const user = await requireCurrentUser(req)
  if (decklist.owner_id !== user.public_id) {
    res.sendStatus(403)
    return
  }
  const { valid } = await validateDeck(decklist.cards, decklist.format)
  if (!valid) {
    res.status(400).send('Deck has validation errors')
  } else {
    console.log(`Publish decklist ${decklist.id} for user ${user.public_id}!`)
    const published = await publishDecklist(req.params.decklistId)
    if (!published) {
      res.sendStatus(404)
    }
    return published
  }
}
