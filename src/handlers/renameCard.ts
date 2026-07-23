import {
  deleteCard,
  deleteCardInPack,
  getAllCardVersions,
  getAllDecklists,
  getAllRulingsForCard,
  getCard,
  insertOrUpdateCard,
  insertOrUpdateCardInPack,
  insertOrUpdateRulingWithExistingId,
  updateCardsInDecklist,
} from '../gateways/storage'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Card, Cards$rename } from '@5rdb/api'

export const schema = {
  body: Joi.object<Cards$rename['request']['body']>({
    existingCardId: Joi.string().required(),
    newCardId: Joi.string().required(),
    name: Joi.string().required(),
    nameExtra: Joi.string().allow(''),
  }),
}

export async function replaceCardReferences(existingCard: Card, newCard: Card): Promise<void> {
  const rulings = await getAllRulingsForCard(existingCard.id)
  await Promise.all(
    rulings.map(async (ruling) => {
      await insertOrUpdateRulingWithExistingId({ ...ruling, card_id: newCard.id })
    })
  )
  const packCards = await getAllCardVersions(existingCard.id)
  await Promise.all(
    packCards.map(async (packCard) => {
      await insertOrUpdateCardInPack({ ...packCard, card_id: newCard.id })
      await deleteCardInPack(packCard.card_id, packCard.pack_id)
    })
  )
  const decklists = (await getAllDecklists()).filter((decklist) => decklist.cards[existingCard.id])
  await Promise.all(
    decklists.map(async (decklist) => {
      const newCards = decklist.cards
      newCards[newCard.id] = newCards[existingCard.id]
      delete newCards[existingCard.id]
      const newPackIds = decklist.card_pack_ids ? { ...decklist.card_pack_ids } : undefined
      if (newPackIds && newPackIds[existingCard.id]) {
        newPackIds[newCard.id] = newPackIds[existingCard.id]
        delete newPackIds[existingCard.id]
      }
      await updateCardsInDecklist(decklist.id, newCards, newPackIds)
    })
  )
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<Card | undefined> {
  console.log('rename card ' + req.body.existingCardId + ' to ' + req.body.newCardId)
  const existingCard = await getCard(req.body.existingCardId)
  if (!existingCard) {
    res.status(400).send(`Card with id ${req.body.existingCardId} doesn't exist.`)
    return
  }
  if (await getCard(req.body.newCardId)) {
    res.status(400).send(`Card with id ${req.body.newCardId} already exists.`)
    return
  }

  const newCard = await insertOrUpdateCard({
    ...existingCard,
    id: req.body.newCardId,
    name: req.body.name,
    name_extra: req.body.nameExtra,
  })
  await replaceCardReferences(existingCard, newCard)
  await deleteCard(existingCard.id)
  return newCard
}
