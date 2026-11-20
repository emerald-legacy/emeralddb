import { getAllCommentsForDecklist } from '../gateways/storage'
import { Request } from 'express'
import { DecklistCommentWithUser } from '@5rdb/api'
import { withUsernames } from '../utils/withUsernames'

export async function handler(req: Request): Promise<DecklistCommentWithUser[] | undefined> {
  const decklistComments = await getAllCommentsForDecklist(req.params.decklistId)
  return withUsernames(decklistComments, 'author_id')
}
