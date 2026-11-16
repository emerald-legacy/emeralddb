import { insertDeck, getDecklist, insertDecklist } from '../gateways/storage'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Deck, Decks$create } from '@5rdb/api'
import { getUserId } from '../utils/getUserId'

export const schema = {
  body: Joi.object<Decks$create['request']['body']>({
    forkedFrom: Joi.string().optional(),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Deck | undefined> {
  const userId = getUserId(req)
  console.log('Create deck for user ' + userId)
  const deck = await insertDeck({ user_id: userId, forked_from: req.body?.forkedFrom })
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
        user_id: userId,
      })
    }
  }
  return deck
}
