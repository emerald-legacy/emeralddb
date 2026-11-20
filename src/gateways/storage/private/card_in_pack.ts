import { pg } from './pg'
import { CardInPack } from '@5rdb/api'

export const TABLE = 'cards_in_packs'

export async function getAllCardsInPacks(): Promise<CardInPack[]> {
  return pg(TABLE).select()
}

export async function getAllCardVersions(cardId: string): Promise<CardInPack[]> {
  return pg(TABLE).where('card_id', cardId)
}

export async function getAllCardsInPack(packId: string): Promise<CardInPack[]> {
  return pg(TABLE).where('pack_id', packId)
}

export async function deleteCardInPack(cardId: string, packId: string): Promise<void> {
  await pg(TABLE).where({ card_id: cardId, pack_id: packId }).delete()
}

export async function insertOrUpdateCardInPack(cardInPack: CardInPack): Promise<CardInPack> {
  const result = await pg(TABLE)
    .insert(cardInPack)
    .onConflict(['card_id', 'pack_id'])
    .merge(['flavor', 'illustrator', 'image_url', 'position', 'quantity', 'rotated'])
    .returning('*')

  return result[0]
}
