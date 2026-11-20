import { User } from '@5rdb/api'
import { pg } from './pg'

export const TABLE = 'users'

export async function getUser(id: string): Promise<User | undefined> {
  return pg(TABLE).where('id', id).first()
}

/** The names of the users with the given public ids, by public id (users.name is nullable) */
export async function getUserNames(publicIds: string[]): Promise<Map<string, string | null>> {
  const users = await pg(TABLE)
    .select('public_id', 'name')
    .whereIn('public_id', [...new Set(publicIds)])
  return new Map(users.map((user) => [user.public_id, user.name]))
}

/**
 * Inserts the user, or returns the existing one unchanged. Two first requests of a new
 * user can race in getOrInsertDBUser; the second must not reset name and roles.
 */
export async function insertUser(user: Omit<User, 'public_id'>): Promise<User> {
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

export async function updateUser(user: Pick<User, 'id' | 'name'>): Promise<User | undefined> {
  const result = await pg(TABLE).where('id', user.id).update({ name: user.name }).returning('*')
  return result[0]
}

export async function getOrInsertDBUser(userId: string): Promise<User> {
  const dbUser = await getUser(userId)
  return dbUser ?? (await insertUser({ id: userId, name: 'Unnamed Samurai', roles: [] }))
}
