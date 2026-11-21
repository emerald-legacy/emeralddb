import { getDeck, insertDecklistOnce } from '../gateways/storage/index'
import { Response } from 'express'
import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { ValidatedRequest } from '../middlewares/validator'
import { Decklist, Decklists$create } from '@5rdb/api'
import { resolveCardPackIds } from './resolveCardPackIds'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<Decklists$create['request']['body']>({
    id: Joi.string().uuid(),
    deck_id: Joi.string().required(),
    format: Joi.string().required(),
    name: Joi.string().required(),
    primary_clan: Joi.string().allow('', null),
    secondary_clan: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    version_number: Joi.string().required(),
    cards: Joi.object().pattern(Joi.string(), Joi.number().integer().min(1).max(3)).required(),
    card_pack_ids: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Response
): Promise<Decklist | undefined> {
  const user = await requireCurrentUser(req)
  // A new version can only be added to one's own deck
  const deck = await getDeck(req.body.deck_id)
  if (!deck) {
    res.sendStatus(404)
    return
  }
  if (deck.owner_id !== user.public_id) {
    res.sendStatus(403)
    return
  }
  console.log('Create decklist for user ' + user.public_id)

  let cardPackIds = req.body.card_pack_ids
  if (!cardPackIds) {
    cardPackIds = await resolveCardPackIds(Object.keys(req.body.cards), req.body.format)
  }

  // Saving is idempotent with an id from the client: a retry or a second click returns the
  // version that was saved first instead of adding another one
  const { id = uuid(), ...decklist } = req.body
  const saved = await insertDecklistOnce({
    ...decklist,
    id,
    card_pack_ids: cardPackIds,
    owner_id: user.public_id,
  })
  if (!saved.inserted && saved.decklist.deck_id !== decklist.deck_id) {
    res.status(409).send('A version with this id belongs to another deck')
    return
  }
  return saved.decklist
}
