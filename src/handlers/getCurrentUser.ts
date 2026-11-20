import { User } from '@5rdb/api'
import * as Express from 'express'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(req: Express.Request): Promise<User> {
  return await requireCurrentUser(req)
}
