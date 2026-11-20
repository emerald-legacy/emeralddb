import { pg } from './pg'
import { Ruling } from '@5rdb/api'

export const TABLE = 'rulings'

export async function getAllRulings(): Promise<Ruling[]> {
  return pg(TABLE).select()
}

export async function getAllRulingsForCard(cardId: string): Promise<Ruling[]> {
  return pg(TABLE).where('card_id', cardId)
}

export async function getRuling(rulingId: number): Promise<Ruling | undefined> {
  return pg(TABLE).where('id', rulingId).first()
}

export async function insertOrUpdateRulingWithExistingId(ruling: Ruling): Promise<Ruling> {
  const [row] = await pg(TABLE)
    .insert({ ...ruling })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}

export async function insertNewRuling(ruling: Omit<Ruling, 'id'>): Promise<Ruling> {
  // TODO: Ugly, but Auto increment doesn't seem to work
  const result = await pg(TABLE).max('id', { as: 'max' }).first()
  const firstNewId = (result?.max ?? 0) + 1
  return pg(TABLE)
    .insert({ ...ruling, id: firstNewId }, '*')
    .then(([row]) => row)
}

export async function deleteRuling(rulingId: number): Promise<void> {
  await pg(TABLE).where('id', rulingId).delete()
}
