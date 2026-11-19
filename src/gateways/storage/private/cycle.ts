import { pg } from './pg'
import { Cycle } from '@5rdb/api'

export const TABLE = 'cycles'

export async function getAllCycles(): Promise<Cycle[]> {
  return pg(TABLE).select()
}

export async function getCycle(cycleId: string): Promise<Cycle | undefined> {
  return pg(TABLE).where('id', cycleId).first()
}

export async function insertOrUpdateCycle(cycle: Cycle): Promise<Cycle> {
  const [row] = await pg(TABLE)
    .insert({ ...cycle })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}
