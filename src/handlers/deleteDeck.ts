import { getDeck, deleteDeck } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { getUserId } from '../utils/getUserId'

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
  const userId = getUserId(req)
  if (deck.user_id !== userId) {
    res.status(403).send()
    return
  }
  await deleteDeck(deckId)
  res.status(200).send()
}
