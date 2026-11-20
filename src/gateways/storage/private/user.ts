import { User } from '@5rdb/api'
import { pg } from './pg'

export const TABLE = 'users'

export async function getUser(id: string): Promise<User | undefined> {
  return pg(TABLE).where('id', id).first()
}

/**
 * Inserts the user, or returns the existing one unchanged. Two first requests of a new
 * user can race in getOrInsertDBUser; the second must not reset name and roles.
 */
export async function insertUser(user: User): Promise<User> {
  await pg(TABLE)
    .insert({ ...user })
    .onConflict('id')
    .ignore()
  const row = await getUser(user.id)
  if (!row) {
    throw new Error(`User ${user.id} was neither inserted nor found`)
  }
  return row
}

export async function updateUser(user: Omit<User, 'roles'>): Promise<User | undefined> {
  const result = await pg(TABLE).where('id', user.id).update({ name: user.name }, '*')
  return result[0]
}

export async function getOrInsertDBUser(userId: string): Promise<User> {
  const dbUser = await getUser(userId)
  return dbUser ?? (await insertUser({ id: userId, name: 'Unnamed Samurai', roles: [] }))
}
