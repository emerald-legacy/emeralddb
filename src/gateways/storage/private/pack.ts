import { pg } from './pg'
import { Pack } from '@5rdb/api'

export const TABLE = 'packs'

const PACK_COLS = [
  'packs.id',
  'packs.name',
  'packs.position',
  'packs.released_at',
  'packs.publisher_id',
  'packs.cycle_id',
  'packs.rotated',
] as const

export async function getAllPacks(): Promise<Pack[]> {
  return pg(TABLE)
    .select(...PACK_COLS)
    .select(pg.raw('COALESCE(SUM(cards_in_packs.quantity), 0)::int AS size'))
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .groupBy('packs.id')
}

export async function getPack(packId: string): Promise<Pack> {
  return pg(TABLE)
    .select(...PACK_COLS)
    .select(pg.raw('COALESCE(SUM(cards_in_packs.quantity), 0)::int AS size'))
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .where('packs.id', packId)
    .groupBy('packs.id')
    .first()
}

export async function insertOrUpdatePack(pack: Pack): Promise<Pack> {
  const { size: _size, ...packWithoutSize } = pack
  const insert = pg(TABLE).insert({ ...packWithoutSize })
  const update = pg.queryBuilder().update({ ...packWithoutSize })
  const result = await pg.raw(`? ON CONFLICT ("id") DO ? returning *`, [insert, update])
  return result.rows[0]
}
