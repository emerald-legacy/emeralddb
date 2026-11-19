import { editComment, getComment } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { DecklistComment, DecklistComments$update } from '@5rdb/api'
import { getUserId } from '../utils/getUserId'

export const schema = {
  body: Joi.object<DecklistComments$update['request']['body']>({
    comment: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<DecklistComment | undefined> {
  const userId = getUserId(req)
  const comment = await getComment(req.params.id)
  if (!comment) {
    res.status(404).send()
    return
  }
  if (comment.user_id !== userId) {
    res.status(403).send()
    return
  }
  const edited = await editComment(req.params.id, req.body.comment)
  if (!edited) {
    res.status(404).send()
  }
  return edited
}
