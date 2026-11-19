import { pg } from './pg'
import { Format, FormatInput } from '@5rdb/api'

export const TABLE = 'formats'

export async function getAllFormats(): Promise<Format[]> {
  return pg(TABLE).select()
}

export async function insertOrUpdateFormat(format: FormatInput): Promise<Format> {
  const [row] = await pg(TABLE)
    .insert({ ...format })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}
