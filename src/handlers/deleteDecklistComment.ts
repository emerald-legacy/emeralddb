import { getComment, deleteComment } from '../gateways/storage'
import { Request, Response } from 'express'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(req: Request, res: Response): Promise<void> {
  const commentId = req.params.id
  const user = await requireCurrentUser(req)
  const comment = await getComment(commentId)
  if (!comment) {
    res.status(404).send()
    return
  }
  if (comment.author_id !== user.public_id) {
    res.status(403).send()
    return
  }
  await deleteComment(commentId)
  res.status(200).send()
}
