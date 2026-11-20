import { insertDeck, getDecklist, insertDecklist } from '../gateways/storage'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Deck, Decks$create } from '@5rdb/api'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const schema = {
  body: Joi.object<Decks$create['request']['body']>({
    forkedFrom: Joi.string().optional(),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Deck | undefined> {
  const user = await requireCurrentUser(req)
  console.log('Create deck for user ' + user.public_id)
  const deck = await insertDeck({ owner_id: user.public_id, forked_from: req.body?.forkedFrom })
  if (req.body?.forkedFrom) {
    const decklist = await getDecklist(req.body?.forkedFrom)
    if (decklist) {
      await insertDecklist({
        deck_id: deck.id,
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
  return deck
}
