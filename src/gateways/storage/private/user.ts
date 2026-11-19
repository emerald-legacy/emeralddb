import { User } from '@5rdb/api'
import { pg } from './pg'

export const TABLE = 'users'

export async function getUser(id: string): Promise<User | undefined> {
  return pg(TABLE).where('id', id).first()
}

export async function insertUser(user: User): Promise<User> {
  const [row] = await pg(TABLE)
    .insert({ ...user })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}

export async function updateUser(user: Omit<User, 'roles'>): Promise<User> {
  const result = await pg(TABLE).where('id', user.id).update({ name: user.name }, '*')
  return result[0]
}

export async function getOrInsertDBUser(userId: string): Promise<User> {
  const dbUser = await getUser(userId)
  return dbUser ?? (await insertUser({ id: userId, name: 'Unnamed Samurai', roles: [] }))
}
