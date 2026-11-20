import { getDeck, deleteDeck } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export async function handler(req: Request, res: Response): Promise<void> {
  const deckId = req.params.deckId
  if (!deckId) {
    res.status(400).send()
    return
  }
  const deck = await getDeck(deckId)
  if (!deck) {
    res.status(404).send()
    return
  }
  const user = await requireCurrentUser(req)
  if (deck.owner_id !== user.public_id) {
    res.status(403).send()
    return
  }
  await deleteDeck(deckId)
  res.status(200).send()
}
