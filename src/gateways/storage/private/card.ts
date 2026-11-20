import { pg } from './pg'
import { Card } from '@5rdb/api'

export const TABLE = 'cards'

export async function getAllCards(): Promise<Card[]> {
  return pg(TABLE).select()
}

export async function getCard(cardId: string): Promise<Card | undefined> {
  return pg(TABLE).where('id', cardId).first()
}

export async function getCards(cardIds: string[]): Promise<Card[]> {
  return pg(TABLE).whereIn('id', cardIds)
}

export async function deleteCard(cardId: string): Promise<void> {
  await pg(TABLE).where('id', cardId).delete()
}

export async function insertOrUpdateCard(card: Card): Promise<Card> {
  const [row] = await pg(TABLE)
    .insert({ ...card })
    .onConflict('id')
    .merge()
    .returning('*')
  return row
}

export async function updateCard(card: Card): Promise<Card | undefined> {
  const result = await pg(TABLE)
    .where('id', card.id)
    .update({ ...card }, '*')
  return result[0]
}
