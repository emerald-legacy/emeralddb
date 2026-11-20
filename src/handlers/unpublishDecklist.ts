import { getDecklist, unpublishDecklist } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Decklist, Decklists$unpublish } from '@5rdb/api'
import { getUserId } from '../utils/getUserId'

export async function handler(
  req: Request<Decklists$unpublish['request']['params']>,
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
  console.log(`Unpublish decklist ${decklist.id} for user ${userId}!`)
  const unpublished = await unpublishDecklist(req.params.decklistId)
  if (!unpublished) {
    res.sendStatus(404)
  }
  return unpublished
}
