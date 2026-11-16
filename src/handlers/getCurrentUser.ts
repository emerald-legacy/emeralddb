import { User } from '@5rdb/api'
import * as Express from 'express'
import { getOrInsertDBUser } from '../gateways/storage'
import { getUserId } from '../utils/getUserId'

export async function handler(req: Express.Request): Promise<User> {
  return await getOrInsertDBUser(getUserId(req))
}
