import { getOrInsertDBUser, updateUser } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Users$update, User } from '@5rdb/api'
import { getUserId } from '../utils/getUserId'

export const schema = {
  body: Joi.object<Users$update['request']['body']>({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<User | undefined> {
  const dbUser = await getOrInsertDBUser(getUserId(req))
  if (dbUser.id !== req.body.id) {
    res.status(403).send()
    return
  }
  const updated = await updateUser(req.body)
  if (!updated) {
    res.status(404).send()
  }
  return updated
}
