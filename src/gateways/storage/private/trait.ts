import { pg } from './pg'
import { Trait } from '@5rdb/api'

export const TABLE = 'traits'

export async function getAllTraits(): Promise<Trait[]> {
  return pg(TABLE).select()
}

export async function getTrait(traitId: string): Promise<Trait | undefined> {
  return pg(TABLE).where('id', traitId).first()
}

export async function insertOrUpdateTrait(trait: Trait): Promise<Trait> {
  const [row] = await pg(TABLE)
    .insert({ ...trait })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}

export async function deleteTrait(traitId: string): Promise<void> {
  await pg(TABLE).where('id', traitId).delete()
}
