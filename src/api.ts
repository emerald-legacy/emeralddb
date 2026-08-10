import { Router } from 'express'
import { asyncHandler } from './utils/asyncHandler'
import * as getAllFormats from './handlers/getAllFormats'
import * as insertOrUpdateFormat from './handlers/insertOrUpdateFormat'
import * as getAllCards from './handlers/getAllCards'
import * as getAllPacks from './handlers/getAllPacks'
import * as createPack from './handlers/createPack'
import * as importPack from './handlers/importPack'
import * as exportPack from './handlers/exportPack'
import * as rotatePack from './handlers/rotatePack'
import * as getAllCycles from './handlers/getAllCycles'
import * as createCycle from './handlers/createCycle'
import * as rotateCycle from './handlers/rotateCycle'
import * as getAllTraits from './handlers/getAllTraits'
import * as updateTrait from './handlers/updateTrait'
import * as deleteTrait from './handlers/deleteTrait'
import * as getDeck from './handlers/getDeck'
import * as getAllDecksForUser from './handlers/getAllDecksForUser'
import * as createDeck from './handlers/createDeck'
import * as getAllPublishedDecklists from './handlers/getAllPublishedDecklists'
import * as getDecklist from './handlers/getDecklist'
import * as publishDecklist from './handlers/publishDecklist'
import * as unpublishDecklist from './handlers/unpublishDecklist'
import * as validateDecklist from './handlers/validateDecklist'
import * as createDecklist from './handlers/createDecklist'
import * as getCardDetails from './handlers/getCardDetails'
import * as updateCard from './handlers/updateCard'
import * as renameCard from './handlers/renameCard'
import * as deleteCard from './handlers/deleteCard'
import * as createCard from './handlers/createCard'
import * as getAllRulings from './handlers/getAllRulings'
import * as updateRuling from './handlers/updateRuling'
import * as createRuling from './handlers/createRuling'
import * as deleteDeck from './handlers/deleteDeck'
import * as deleteDecklist from './handlers/deleteDecklist'
import * as deleteRuling from './handlers/deleteRuling'
import * as getCurrentUser from './handlers/getCurrentUser'
import * as updateUser from './handlers/updateUser'
import * as updateCardsInPack from './handlers/updateCardsInPack'
import * as updateCardInPack from './handlers/updateCardInPack'
import * as deleteCardInPack from './handlers/deleteCardInPack'
import * as createDecklistComment from './handlers/createDecklistComment'
import * as updateDecklistComment from './handlers/updateDecklistComment'
import * as deleteDecklistComment from './handlers/deleteDecklistComment'
import * as getAllCommentsForDecklist from './handlers/getAllCommentsForDecklist'
import * as imageProxy from './handlers/imageProxy'
import { authorizedOnly, dataAdminOnly, rulesAdminOnly } from './middlewares/authorization'
import { validate } from './middlewares/validator'
import env from './env'

export default (): Router => {
  const api = Router()
  const w = asyncHandler // shorthand for wrapping handlers

  api.get('/image-proxy', imageProxy.handler)
  api.get('/cards', w(getAllCards.handler))
  api.get('/cards/:cardId', w(getCardDetails.handler))
  api.post(
    '/cards/:cardId',
    authorizedOnly,
    w(dataAdminOnly),
    validate(updateCard.schema),
    w(updateCard.handler)
  )
  api.delete(
    '/cards/:cardId',
    authorizedOnly,
    w(dataAdminOnly),
    validate(deleteCard.schema),
    w(deleteCard.handler)
  )
  api.post(
    '/cards/:cardId/rename',
    authorizedOnly,
    w(dataAdminOnly),
    validate(renameCard.schema),
    w(renameCard.handler)
  )
  api.put(
    '/cards',
    authorizedOnly,
    w(dataAdminOnly),
    validate(createCard.schema),
    w(createCard.handler)
  )
  api.get('/packs', w(getAllPacks.handler))
  api.put(
    '/packs',
    authorizedOnly,
    w(dataAdminOnly),
    validate(createPack.schema),
    w(createPack.handler)
  )
  api.put(
    '/packs/import',
    authorizedOnly,
    w(dataAdminOnly),
    validate(importPack.schema),
    w(importPack.handler)
  )
  api.put('/packs/rotate/:id', authorizedOnly, w(dataAdminOnly), w(rotatePack.handler))
  api.get('/packs/export/:id', w(exportPack.handler))
  api.post(
    '/cards-in-packs',
    authorizedOnly,
    w(dataAdminOnly),
    validate(updateCardsInPack.schema),
    w(updateCardsInPack.handler)
  )
  api.put(
    '/cards-in-packs',
    authorizedOnly,
    w(dataAdminOnly),
    validate(updateCardInPack.schema),
    w(updateCardInPack.handler)
  )
  api.delete(
    '/cards-in-packs',
    authorizedOnly,
    w(dataAdminOnly),
    validate(deleteCardInPack.schema),
    w(deleteCardInPack.handler)
  )
  api.get('/formats', w(getAllFormats.handler))
  api.put(
    '/formats',
    authorizedOnly,
    w(dataAdminOnly),
    validate(insertOrUpdateFormat.schema),
    w(insertOrUpdateFormat.handler)
  )
  api.get('/cycles', w(getAllCycles.handler))
  api.put(
    '/cycles',
    authorizedOnly,
    w(dataAdminOnly),
    validate(createCycle.schema),
    w(createCycle.handler)
  )
  api.put('/cycles/rotate/:id', authorizedOnly, w(dataAdminOnly), w(rotateCycle.handler))
  api.get('/traits', w(getAllTraits.handler))
  api.put(
    '/traits',
    authorizedOnly,
    w(dataAdminOnly),
    validate(updateTrait.schema),
    w(updateTrait.handler)
  )
  api.delete(
    '/traits',
    authorizedOnly,
    w(dataAdminOnly),
    validate(deleteTrait.schema),
    w(deleteTrait.handler)
  )
  api.get('/users/me', authorizedOnly, w(getCurrentUser.handler))
  api.put('/users/me', authorizedOnly, validate(updateUser.schema), w(updateUser.handler))
  api.get('/decks/:deckId', w(getDeck.handler))
  api.post('/decks', w(getAllDecksForUser.handler))
  api.put('/decks', authorizedOnly, validate(createDeck.schema), w(createDeck.handler))
  api.delete('/decks/:deckId', authorizedOnly, w(deleteDeck.handler))
  api.get('/decklists', w(getAllPublishedDecklists.handler))
  api.get('/decklists/:decklistId', w(getDecklist.handler))
  api.post('/decklists/:decklistId/publish', authorizedOnly, w(publishDecklist.handler))
  api.post('/decklists/:decklistId/unpublish', authorizedOnly, w(unpublishDecklist.handler))
  api.post('/decklists/validate', validate(validateDecklist.schema), w(validateDecklist.handler))
  api.delete('/decklists/:decklistId', authorizedOnly, w(deleteDecklist.handler))
  api.put('/decklists', authorizedOnly, validate(createDecklist.schema), w(createDecklist.handler))
  api.get('/rulings', w(getAllRulings.handler))
  api.put(
    '/rulings',
    authorizedOnly,
    w(rulesAdminOnly),
    validate(createRuling.schema),
    w(createRuling.handler)
  )
  api.post(
    '/rulings/:rulingId',
    authorizedOnly,
    w(rulesAdminOnly),
    validate(updateRuling.schema),
    w(updateRuling.handler)
  )
  api.delete('/rulings/:rulingId', authorizedOnly, w(rulesAdminOnly), w(deleteRuling.handler))
  api.get('/decklists/:decklistId/comments', w(getAllCommentsForDecklist.handler))
  api.put(
    '/comments',
    authorizedOnly,
    validate(createDecklistComment.schema),
    w(createDecklistComment.handler)
  )
  api.post(
    '/comments/:id',
    authorizedOnly,
    validate(updateDecklistComment.schema),
    w(updateDecklistComment.handler)
  )
  api.delete('/comments/:id', authorizedOnly, w(deleteDecklistComment.handler))
  api.get('/auth0', (_req, res) => {
    res.json({
      domain: env.auth0Domain,
      clientId: env.auth0ClientId,
    })
  })
  api.get('/beta-url', (_req, res) => {
    res.json({
      betaUrl: env.betaUrl,
    })
  })
  return api
}
