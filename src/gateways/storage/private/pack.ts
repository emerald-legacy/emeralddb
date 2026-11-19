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

// The pack size isn't stored; it's the sum of the card quantities.
// Knex can't type a raw column, so select<Pack[]> declares the resulting row
// (part of the DB trust boundary, see src/typings/knexTables.d.ts).
const packSize = () => pg.raw('COALESCE(SUM(cards_in_packs.quantity), 0)::int AS size')

export async function getAllPacks(): Promise<Pack[]> {
  return pg(TABLE)
    .select<Pack[]>(...PACK_COLS, packSize())
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .groupBy('packs.id')
}

export async function getPack(packId: string): Promise<Pack | undefined> {
  return pg(TABLE)
    .select<Pack[]>(...PACK_COLS, packSize())
    .leftJoin('cards_in_packs', 'cards_in_packs.pack_id', 'packs.id')
    .where('packs.id', packId)
    .groupBy('packs.id')
    .first()
}

// Callers often pass a Pack from the API, so a computed size is dropped here
export async function insertOrUpdatePack(
  pack: Omit<Pack, 'size'> & { size?: number }
): Promise<Omit<Pack, 'size'>> {
  const { size: _size, ...packWithoutSize } = pack
  const [row] = await pg(TABLE)
    .insert({ ...packWithoutSize })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}
