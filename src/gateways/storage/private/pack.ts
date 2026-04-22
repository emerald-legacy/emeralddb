import { pg } from './pg'
import { Pack } from '@5rdb/api'

export const TABLE = 'packs'

// Columns on the `packs` table EXCEPT `size` — we compute that from
// `cards_in_packs` rather than reading the stored value, which has drifted.
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
    .select(pg.raw('COUNT(DISTINCT cards_in_packs.card_id)::int AS size'))
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .groupBy('packs.id')
}

export async function getPack(packId: string): Promise<Pack> {
  return pg(TABLE)
    .select(...PACK_COLS)
    .select(pg.raw('COUNT(DISTINCT cards_in_packs.card_id)::int AS size'))
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .where('packs.id', packId)
    .groupBy('packs.id')
    .first()
}

export async function insertOrUpdatePack(pack: Pack): Promise<Pack> {
  // `size` is derived on read; strip it from writes so the stored column
  // stays whatever it was (dead storage) and we never drift further.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { size: _size, ...packWithoutSize } = pack
  const insert = pg(TABLE).insert({ ...packWithoutSize })
  const update = pg.queryBuilder().update({ ...packWithoutSize })
  const result = await pg.raw(`? ON CONFLICT ("id") DO ? returning *`, [insert, update])
  return result.rows[0]
}
