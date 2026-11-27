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
import { Card, Cards$delete, Decklist } from '@5rdb/api'
import { resolveCardPackIds } from './resolveCardPackIds'

export const schema = {
  body: Joi.object<Cards$delete['request']['body']>({
    replacementCardId: Joi.string().allow('', null),
  }),
}

/**
 * The cards and pack ids of a decklist after `deletedCardId` is replaced by `replacement`.
 * The copies are added to those of the replacement, up to its deck limit, so that the
 * builder can still save the deck. The replacement keeps its pack id if the deck had it
 * already, and otherwise gets `replacementPackId`, a printing that is legal in the deck's
 * format, or none.
 */
export function replaceCard(
  decklist: Pick<Decklist, 'cards' | 'card_pack_ids'>,
  deletedCardId: string,
  replacement: Pick<Card, 'id' | 'deck_limit'>,
  replacementPackId: string | undefined
): { cards: Record<string, number>; cardPackIds: Record<string, string> | undefined } {
  const { [deletedCardId]: deletedCopies = 0, ...cards } = decklist.cards
  cards[replacement.id] = Math.min(
    (cards[replacement.id] ?? 0) + deletedCopies,
    replacement.deck_limit
  )
  if (!decklist.card_pack_ids) {
    return { cards, cardPackIds: undefined }
  }
  const { [deletedCardId]: _deletedPackId, ...cardPackIds } = decklist.card_pack_ids
  const packId = cardPackIds[replacement.id] ?? replacementPackId
  if (packId) {
    cardPackIds[replacement.id] = packId
  }
  return { cards, cardPackIds }
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
    // A legal printing of the replacement in each format, for decks that didn't have it
    const packIdByFormat = new Map<string, string | undefined>()
    for (const format of new Set(decklists.map((decklist) => decklist.format))) {
      const packIds = await resolveCardPackIds([replacementCard.id], format)
      packIdByFormat.set(format, packIds[replacementCard.id])
    }
    for (const decklist of decklists) {
      const { cards, cardPackIds } = replaceCard(
        decklist,
        existingCard.id,
        replacementCard,
        packIdByFormat.get(decklist.format)
      )
      await updateCardsInDecklist(decklist.id, cards, cardPackIds)
    }
  }
  await deleteCardReferences(existingCard)
  await deleteCard(existingCard.id)
  res.status(200).send()
}
