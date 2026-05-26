import {
  Card,
  Cycle,
  Deck,
  Decklist,
  Ruling,
  Pack,
  User,
  CardInPack,
  Trait,
  Format,
} from './baseTypes'
import {
  CardWithVersions,
  CardWithDetails,
  DeckWithVersions,
  DecklistWithUser,
  DecklistCommentWithUser,
} from './compositeTypes'

export interface Cards$findAll {
  response: CardWithVersions[]
}

export interface Cards$find {
  response: CardWithDetails
}

export interface Cards$update {
  request: { body: Card }
  response: Card
}

export interface Cards$rename {
  request: { body: { existingCardId: string; newCardId: string; name: string; nameExtra?: string } }
  response: Card
}

export interface Cards$create {
  request: { body: Card }
  response: Card
}

export interface Cards$delete {
  request: { params: { cardId: string }; body: { replacementCardId?: string } }
}

export interface Formats$insertOrUpdate {
  request: { body: { format: Format } }
  response: Format
}

export interface Formats$findAll {
  response: Format[]
}

export interface Packs$findAll {
  response: Pack[]
}

export interface Packs$create {
  request: { body: Pack }
  response: Pack
}

export interface Cycles$findAll {
  response: Cycle[]
}

export interface Cycles$create {
  request: { body: Cycle }
  response: Cycle
}

export interface Cycles$rotate {
  request: { params: { id: string } }
}

export interface Users$me {
  response: User
}

export interface Users$update {
  request: { body: { id: string; name: string } }
  response: User
}

export interface Decks$create {
  request: { body: { forkedFrom?: string | undefined } }
  response: Deck
}

export interface CardInPacks$updateAll {
  request: { body: { cardsInPacks: CardInPack[] } }
  response: CardInPack[]
}

export interface CardInPacks$insertOrUpdate {
  request: { body: { cardInPack: CardInPack } }
}

export interface CardInPacks$delete {
  request: { body: { cardInPack: CardInPack } }
}

export interface Decks$find {
  request: { params: { deckId: string } }
  response: DeckWithVersions
}

export interface Decks$findForUser {
  request: { body: { userId: string } }
  response: DeckWithVersions[]
}

export interface Decks$delete {
  request: { params: { deckId: string } }
}

export interface Decklists$create {
  request: { body: Omit<Decklist, 'id' | 'created_at' | 'user_id'> }
  response: Decklist
}

export interface Decklists$find {
  request: { params: { decklistId: string } }
  response: DecklistWithUser
}

export interface Decklists$delete {
  request: { params: { decklistId: string } }
}

export interface Decklists$validate {
  request: { body: { cards: Record<string, number>; format: string } }
  response: { valid: boolean; errors: string[] }
}

export interface Decklists$findAllPublished {
  response: Pick<
    DecklistWithUser,
    'id' | 'username' | 'name' | 'format' | 'primary_clan' | 'secondary_clan' | 'published_date'
  >[]
}

export interface Decklists$publish {
  request: { params: { decklistId: string } }
}

export interface Decklists$unpublish {
  request: { params: { decklistId: string } }
}

export interface Ruling$findAll {
  response: Ruling[]
}

export interface Ruling$create {
  request: { body: Omit<Ruling, 'id'> }
  response: Ruling
}

export interface Ruling$update {
  request: { body: Ruling }
  response: Ruling
}

export interface Ruling$delete {
  request: { params: { rulingId: string } }
}

export interface DecklistComments$findForDecklist {
  request: { params: { decklistId: string } }
  response: DecklistCommentWithUser[]
}

export interface DecklistComments$create {
  request: { body: { comment: string; decklist_id: string; parent_comment_id?: string } }
}

export interface DecklistComments$delete {
  request: { params: { id: string } }
}

export interface DecklistComments$update {
  request: { params: { id: string }; body: { comment: string } }
}

export interface Pack$import {
  request: {
    body: {
      pack: Pack
      cards: Card[]
      cardsInPack: CardInPack[]
    }
  }
}

export interface Pack$export {
  request: { params: { id: string } }
  response: {
    pack: Pack
    cards: Card[]
    cardsInPack: CardInPack[]
  }
}

export interface Pack$rotate {
  request: { params: { id: string } }
}

export interface Traits$insertOrUpdate {
  request: { body: { trait: Trait } }
}

export interface Traits$delete {
  request: { body: { trait: Trait } }
}
