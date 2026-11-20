import { editComment, getComment } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { DecklistComment, DecklistComments$update } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<DecklistComments$update['request']['body']>({
    comment: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<DecklistComment | undefined> {
  const user = await requireCurrentUser(req)
  const comment = await getComment(req.params.id)
  if (!comment) {
    res.status(404).send()
    return
  }
  if (comment.author_id !== user.public_id) {
    res.status(403).send()
    return
  }
  const edited = await editComment(req.params.id, req.body.comment)
  if (!edited) {
    res.status(404).send()
  }
  return edited
}
