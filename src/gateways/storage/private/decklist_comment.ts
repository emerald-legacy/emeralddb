import { pg } from './pg'
import { DecklistComment } from '@5rdb/api'
import { v4 as uuid } from 'uuid'

export const TABLE = 'decklist_comments'

export async function getAllCommentsForDecklist(decklistId: string): Promise<DecklistComment[]> {
  return pg(TABLE).where('decklist_id', decklistId)
}

export async function insertComment(
  comment: Omit<DecklistComment, 'id' | 'created_at' | 'edited_at'>
): Promise<DecklistComment> {
  const id = uuid()
  const now = new Date()
  return pg(TABLE)
    .insert({ ...comment, id: id, created_at: now }, '*')
    .then(([row]) => row)
}

export async function getComment(commentId: string): Promise<DecklistComment | undefined> {
  return pg(TABLE).where('id', commentId).first()
}

export async function editComment(
  commentId: string,
  newText: string
): Promise<DecklistComment | undefined> {
  const now = new Date()
  const result = await pg(TABLE)
    .where('id', commentId)
    .update({ comment: newText, edited_at: now })
    .returning('*')
  return result[0]
}

export async function deleteComment(commentId: string): Promise<void> {
  const childComments = await pg(TABLE).where('parent_comment_id', commentId)
  for (const comment of childComments) {
    await deleteComment(comment.id)
  }
  await pg(TABLE).where('id', commentId).delete()
}
