import { updateUser } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Users$update, User } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<Users$update['request']['body'] & { id?: string }>({
    name: Joi.string().required(),
    // Sent by clients from before it was dropped from the contract; must be the caller's
    id: Joi.string(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<User | undefined> {
  const dbUser = await requireCurrentUser(req)
  if (req.body.id !== undefined && req.body.id !== dbUser.id) {
    res.status(403).send()
    return
  }
  const updated = await updateUser({ id: dbUser.id, name: req.body.name })
  if (!updated) {
    res.status(404).send()
  }
  return updated
}
