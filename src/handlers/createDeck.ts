import { insertDeckOnce, getDecklist, insertDecklist } from '../gateways/storage'
import { Response } from 'express'
import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { ValidatedRequest } from '../middlewares/validator'
import { Deck, Decks$create } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<Decks$create['request']['body']>({
    id: Joi.string().uuid(),
    forkedFrom: Joi.string().optional(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Response
): Promise<Deck | undefined> {
  const user = await requireCurrentUser(req)
  // Creating is idempotent with an id from the client: a retry returns the deck created
  // first, without a second copy of the forked version
  const { id = uuid(), forkedFrom } = req.body ?? {}
  const saved = await insertDeckOnce({ id, owner_id: user.public_id, forked_from: forkedFrom })
  if (!saved.inserted) {
    if (saved.deck.owner_id !== user.public_id) {
      res.status(409).send('A deck with this id exists already')
      return
    }
    return saved.deck
  }
  console.log('Created deck for user ' + user.public_id)

  if (forkedFrom) {
    const decklist = await getDecklist(forkedFrom)
    if (decklist) {
      await insertDecklist({
        deck_id: saved.deck.id,
        format: decklist.format,
        name: 'Copy of ' + decklist.name,
        primary_clan: decklist.primary_clan,
        secondary_clan: decklist.secondary_clan,
        description: 'Original description: ' + decklist.description,
        version_number: '0.1',
        cards: decklist.cards,
        published_date: undefined,
        owner_id: user.public_id,
      })
    }
  }
  return saved.deck
}
