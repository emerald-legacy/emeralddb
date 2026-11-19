import { getAllCommentsForDecklist, getUser } from '../gateways/storage'
import { Request } from 'express'
import { DecklistCommentWithUser } from '@5rdb/api'

export async function handler(req: Request): Promise<DecklistCommentWithUser[] | undefined> {
  const decklistComments = await getAllCommentsForDecklist(req.params.decklistId)
  return await Promise.all(
    decklistComments.map(async (comment) => {
      const user = await getUser(comment.user_id)
      return {
        ...comment,
        username: user?.name ?? 'Unknown user',
      }
    })
  )
}
