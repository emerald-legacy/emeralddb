import { Response } from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { DecklistComment, DecklistComments$create } from '@5rdb/api'
import { getComment, getDecklist, insertComment } from '../gateways/storage'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<DecklistComments$create['request']['body']>({
    comment: Joi.string().required(),
    decklist_id: Joi.string().required(),
    parent_comment_id: Joi.string(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Response
): Promise<DecklistComment | undefined> {
  const user = await requireCurrentUser(req)
  const { comment, decklist_id, parent_comment_id } = req.body
  // decklist_comments has no foreign keys, so the database accepts any id
  if (!(await getDecklist(decklist_id))) {
    res.status(404).send('The decklist does not exist')
    return
  }
  if (parent_comment_id) {
    const parent = await getComment(parent_comment_id)
    if (parent?.decklist_id !== decklist_id) {
      res.status(400).send('The comment to reply to is not a comment on this decklist')
      return
    }
  }
  return insertComment({ comment, decklist_id, parent_comment_id, author_id: user.public_id })
}
