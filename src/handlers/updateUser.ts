import { updateUser } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Users$update, User } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<Users$update['request']['body']>({
    name: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<User | undefined> {
  const dbUser = await requireCurrentUser(req)
  const updated = await updateUser({ id: dbUser.id, name: req.body.name })
  if (!updated) {
    res.status(404).send()
  }
  return updated
}
