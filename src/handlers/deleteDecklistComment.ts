import { getComment, deleteComment } from '../gateways/storage'
import { Request, Response } from 'express'
import { getUserId } from '../utils/getUserId'

export async function handler(req: Request, res: Response): Promise<void> {
  const commentId = req.params.id
  const userId = getUserId(req)
  const comment = await getComment(commentId)
  if (!comment) {
    res.status(404).send()
    return
  }
  if (comment.user_id !== userId) {
    res.status(403).send()
    return
  }
  await deleteComment(commentId)
  res.status(200).send()
}
