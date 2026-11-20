import {
  getDecklist,
  deleteDecklist,
  getAllDecklistsForDeck,
  deleteDeck,
} from '../gateways/storage/index'
import { Request, Response } from 'express'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(req: Request, res: Response): Promise<void> {
  const decklistId = req.params.decklistId
  if (!decklistId) {
    res.status(400).send()
    return
  }
  const decklist = await getDecklist(decklistId)
  if (!decklist) {
    res.status(404).send()
    return
  }
  const user = await requireCurrentUser(req)
  if (decklist.owner_id !== user.public_id) {
    res.status(403).send()
    return
  }
  await deleteDecklist(decklistId)
  if ((await getAllDecklistsForDeck(decklist.deck_id)).length === 0) {
    await deleteDeck(decklist.deck_id)
  }
  res.status(200).send()
}
