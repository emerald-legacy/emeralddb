/**
 * Copies the card data of a live EmeraldDB instance into the local database:
 * traits, cycles, packs, cards, their printings, formats and rulings.
 * User data (users, decks, comments) is not touched.
 *
 * Rows are upserted by id, so local rows that don't exist on the instance stay.
 * Everything runs in one transaction: it imports all of it or nothing.
 *
 * Usage: yarn import:prod [https://www.emeralddb.org/]
 */
import Joi from 'joi'
import { Card, CardInPack, Cycle, Format, Pack, Ruling, Trait } from '@5rdb/api'
import env from '../env'
import { pg } from '../gateways/storage/private/pg'

const DEFAULT_URL = 'https://www.emeralddb.org/'
// Postgres allows 65535 parameters per query, cards have about 30 columns
const CHUNK_SIZE = 500

// The rows are checked loosely, like in importPack: an id, the rest as the API sends it
function rowsSchema<Row>(idSchema: Joi.Schema, extraKeys: Joi.PartialSchemaMap<Row> = {}) {
  return Joi.array<Row[]>()
    .items(
      Joi.object<Row>({ id: idSchema, ...extraKeys })
        .unknown(true)
        .required()
    )
    .required()
}

const cardInPackSchema = Joi.object<CardInPack>({
  card_id: Joi.string().required(),
  pack_id: Joi.string().required(),
}).unknown(true)

type CardWithPrintings = Card & { versions: CardInPack[] }

const schemas = {
  traits: rowsSchema<Trait>(Joi.string().required()),
  cycles: rowsSchema<Cycle>(Joi.string().required()),
  // size is computed from the printings, not stored
  packs: rowsSchema<Pack>(Joi.string().required(), { size: Joi.any().strip() }),
  cards: rowsSchema<CardWithPrintings>(Joi.string().required(), {
    versions: Joi.array().items(cardInPackSchema).required(),
  }),
  formats: rowsSchema<Format>(Joi.string().required()),
  rulings: rowsSchema<Ruling>(Joi.number().integer().required()),
}

async function download<Row>(baseUrl: string, path: string, schema: Joi.ArraySchema<Row[]>) {
  const response = await fetch(new URL(`api/${path}`, baseUrl))
  if (!response.ok) {
    throw Error(`GET ${response.url} failed: ${response.status} ${response.statusText}`)
  }
  const body: unknown = await response.json()
  const result = schema.validate(body)
  if (result.error) {
    throw Error(`Unexpected data from ${response.url}: ${result.error.message}`)
  }
  console.log(`Downloaded ${result.value.length} ${path}`)
  return result.value
}

async function upsertInChunks<Row>(
  table: string,
  rows: Row[],
  upsertChunk: (chunk: Row[]) => Promise<unknown>
) {
  for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
    await upsertChunk(rows.slice(start, start + CHUNK_SIZE))
  }
  console.log(`Imported ${rows.length} ${table}`)
}

async function main() {
  // pg.ts uses DATABASE_URL; only a development setup may be overwritten this way
  if (env.nodeEnv !== 'development') {
    throw Error(
      `NODE_ENV is "${env.nodeEnv}"; this script only runs against a development database`
    )
  }
  const baseUrl = process.argv[2] ?? DEFAULT_URL
  console.log(`Importing from ${baseUrl}`)

  const [traits, cycles, packs, cards, formats, rulings] = await Promise.all([
    download(baseUrl, 'traits', schemas.traits),
    download(baseUrl, 'cycles', schemas.cycles),
    download(baseUrl, 'packs', schemas.packs),
    download(baseUrl, 'cards', schemas.cards),
    download(baseUrl, 'formats', schemas.formats),
    download(baseUrl, 'rulings', schemas.rulings),
  ])
  const cardsInPacks = cards.flatMap((card) => card.versions)
  const cardsWithoutPrintings = cards.map(({ versions: _versions, ...card }) => card)

  // In foreign key order: packs need cycles, printings need cards and packs, rulings need cards
  await pg.transaction(async (transaction) => {
    await upsertInChunks('traits', traits, (chunk) =>
      transaction('traits').insert(chunk).onConflict('id').merge()
    )
    await upsertInChunks('cycles', cycles, (chunk) =>
      transaction('cycles').insert(chunk).onConflict('id').merge()
    )
    await upsertInChunks('packs', packs, (chunk) =>
      transaction('packs').insert(chunk).onConflict('id').merge()
    )
    await upsertInChunks('cards', cardsWithoutPrintings, (chunk) =>
      transaction('cards').insert(chunk).onConflict('id').merge()
    )
    await upsertInChunks('cards_in_packs', cardsInPacks, (chunk) =>
      transaction('cards_in_packs').insert(chunk).onConflict(['card_id', 'pack_id']).merge()
    )
    await upsertInChunks('formats', formats, (chunk) =>
      transaction('formats').insert(chunk).onConflict('id').merge()
    )
    await upsertInChunks('rulings', rulings, (chunk) =>
      transaction('rulings').insert(chunk).onConflict('id').merge()
    )
  })
  console.log('Done')
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pg.destroy())
