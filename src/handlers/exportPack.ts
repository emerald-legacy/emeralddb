import { getAllCardsInPack, getCard, getPack, getTraits } from '../gateways/storage/index'
import { Request, Response } from 'express'
import { Pack$export } from '@5rdb/api'

export async function handler(
  req: Request<Pack$export['request']['params']>,
  res: Response<Pack$export['response']>
): Promise<Pack$export['response'] | undefined> {
  const pack = await getPack(req.params.id)
  if (!pack) {
    res.sendStatus(404)
    return
  }
  console.log(`Export pack ${pack.name}`)
  const cardsInPack = await getAllCardsInPack(pack.id)
  const cards = (
    await Promise.all(cardsInPack.map(async (cardInPack) => await getCard(cardInPack.card_id)))
  ).filter((card) => card !== undefined)
  const traitIds = new Set(cards.flatMap((card) => card.traits ?? []))
  return {
    pack: pack,
    cards: cards,
    cardsInPack: cardsInPack,
    traits: await getTraits([...traitIds]),
  }
}
