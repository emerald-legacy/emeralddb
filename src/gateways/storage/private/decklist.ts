import { pg } from './pg'
import { Decklist } from '@5rdb/api'
import { v4 as uuid } from 'uuid'

export const TABLE = 'decklists'

export async function getDecklist(decklistId: string): Promise<Decklist | undefined> {
  return pg(TABLE).where('id', decklistId).first()
}

export async function getAllDecklistsForDeck(deckId: string): Promise<Decklist[]> {
  return pg(TABLE).where('deck_id', deckId)
}

export async function getAllPublishedDecklists(): Promise<Decklist[]> {
  return pg(TABLE).whereNotNull('published_date')
}

export async function getAllDecklists(): Promise<Decklist[]> {
  return pg(TABLE).select()
}

export async function updateCardsInDecklist(
  decklistId: string,
  cards: Record<string, number>,
  cardPackIds?: Record<string, string>
): Promise<Decklist | undefined> {
  const updateData: Record<string, unknown> = { cards }
  if (cardPackIds !== undefined) {
    updateData.card_pack_ids = cardPackIds
  }
  const result = await pg(TABLE).where('id', decklistId).update(updateData, '*')
  return result[0]
}

export async function insertDecklist(
  decklist: Omit<Decklist, 'id' | 'created_at'>
): Promise<Decklist> {
  const id = uuid()
  return pg(TABLE)
    .insert({ ...decklist, id: id, created_at: new Date() }, '*')
    .then(([row]) => row)
}

export async function publishDecklist(decklistId: string): Promise<Decklist | undefined> {
  const publishedDate = new Date()
  const result = await pg(TABLE)
    .where('id', decklistId)
    .update({ published_date: publishedDate })
    .returning('*')
  return result[0]
}

export async function unpublishDecklist(decklistId: string): Promise<Decklist | undefined> {
  const result = await pg(TABLE)
    .where('id', decklistId)
    .update({ published_date: null })
    .returning('*')
  return result[0]
}

export async function deleteDecklist(decklistId: string): Promise<void> {
  await pg(TABLE).where('id', decklistId).delete()
}
