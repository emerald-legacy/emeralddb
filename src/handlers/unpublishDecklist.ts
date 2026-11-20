import { getDecklist, unpublishDecklist } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$unpublish } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(
  req: Request<Decklists$unpublish['request']['params']>,
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
  console.log(`Unpublish decklist ${decklist.id} for user ${user.public_id}!`)
  const unpublished = await unpublishDecklist(req.params.decklistId)
  if (!unpublished) {
    res.sendStatus(404)
  }
  return unpublished
}
