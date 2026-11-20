import { Request } from 'express'
import { User } from '@5rdb/api'
import { getOrInsertDBUser } from '../gateways/storage'
import { getUserId } from './getUserId'

/**
 * The logged-in user, created on the first request. Decks, decklists and comments refer
 * to users by public_id, so ownership checks compare against `public_id` from here.
 * Throws a 401 if the request isn't authenticated, so use it only behind `authorizedOnly`.
 */
export async function requireCurrentUser(req: Request): Promise<User> {
  return getOrInsertDBUser(getUserId(req))
}
