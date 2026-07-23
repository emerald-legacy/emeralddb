import {
  deleteCard,
  deleteCardInPack,
  deleteRuling,
  getAllCardVersions,
  getAllDecklists,
  getAllRulingsForCard,
  getCard,
  updateCardsInDecklist,
} from '../gateways/storage'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Card, Cards$delete } from '@5rdb/api'

export const schema = {
  body: Joi.object<Cards$delete['request']['body']>({
    replacementCardId: Joi.string().allow(''),
  }),
}

export async function deleteCardReferences(existingCard: Card): Promise<void> {
  const rulings = await getAllRulingsForCard(existingCard.id)
  await Promise.all(
    rulings.map(async (ruling) => {
      await deleteRuling(ruling.id)
    })
  )
  const packCards = await getAllCardVersions(existingCard.id)
  await Promise.all(
    packCards.map(async (packCard) => {
      await deleteCardInPack(packCard.card_id, packCard.pack_id)
    })
  )
  const decklists = (await getAllDecklists()).filter((decklist) => decklist.cards[existingCard.id])
  console.log('Decklists with ' + existingCard.id + ': ' + decklists.length)
  await Promise.all(
    decklists.map(async (decklist) => {
      const newCards = decklist.cards
      delete newCards[existingCard.id]
      const newPackIds = decklist.card_pack_ids ? { ...decklist.card_pack_ids } : undefined
      if (newPackIds) {
        delete newPackIds[existingCard.id]
      }
      await updateCardsInDecklist(decklist.id, newCards, newPackIds)
    })
  )
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<void> {
  const cardId = req.params.cardId
  console.log('delete card ' + cardId)
  const existingCard = await getCard(cardId)
  if (!existingCard) {
    res.status(400).send(`Card with id ${cardId} doesn't exist.`)
    return
  }
  const replacementCardId = req.body.replacementCardId
  if (replacementCardId) {
    const replacementCard = await getCard(replacementCardId)
    if (!replacementCard) {
      res.status(400).send(`Replacement Card with id ${replacementCardId} doesn't exists.`)
      return
    }
    const decklists = (await getAllDecklists()).filter(
      (decklist) => decklist.cards[existingCard.id]
    )
    console.log('Decklists with ' + existingCard.id + ': ' + decklists.length)
    await Promise.all(
      decklists.map(async (decklist) => {
        const newCards = decklist.cards
        newCards[replacementCard.id] = newCards[existingCard.id]
        delete newCards[existingCard.id]
        const newPackIds = decklist.card_pack_ids ? { ...decklist.card_pack_ids } : undefined
        if (newPackIds) {
          newPackIds[replacementCard.id] = newPackIds[existingCard.id] || ''
          delete newPackIds[existingCard.id]
        }
        await updateCardsInDecklist(decklist.id, newCards, newPackIds)
      })
    )
  }
  await deleteCardReferences(existingCard)
  await deleteCard(existingCard.id)
  res.status(200).send()
}
