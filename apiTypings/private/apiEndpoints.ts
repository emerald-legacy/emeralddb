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
  PublishedDecklistWithExtraInfo,
} from './compositeTypes'

/**
 * A request body for a row: optional columns may also be sent as null, which
 * clears them in the database (the server's Joi schemas allow it).
 */
export type Clearable<Row> = {
  [Column in keyof Row]: undefined extends Row[Column] ? Row[Column] | null : Row[Column]
}

export type CardInput = Clearable<Card>

// size is computed by the server; rotated defaults to false
export type PackInput = Clearable<
  Omit<Pack, 'size' | 'rotated' | 'released_at'> & {
    rotated?: boolean
    // A string in JSON, which the server converts to a Date
    released_at?: Date | string
    // Accepted for clients that send a whole Pack, but ignored
    size?: number
  }
>

// rotated defaults to false, and is changed with Cycles$rotate
export type CycleInput = Omit<Cycle, 'rotated'>

export type FormatInput = Clearable<Format>

export interface Cards$findAll {
  response: CardWithVersions[]
}

export interface Cards$find {
  request: { params: { cardId: string } }
  response: CardWithDetails
}

export interface Cards$update {
  request: { params: { cardId: string }; body: CardInput }
  response: Card
}

export interface Cards$rename {
  request: {
    params: { cardId: string }
    body: { existingCardId: string; newCardId: string; name: string; nameExtra?: string }
  }
  response: Card
}

export interface Cards$create {
  request: { body: CardInput }
  response: Card
}

export interface Cards$delete {
  request: { params: { cardId: string }; body: { replacementCardId?: string } }
}

export interface Formats$insertOrUpdate {
  request: { body: { format: FormatInput } }
  response: Format
}

export interface Formats$findAll {
  response: Format[]
}

export interface Packs$findAll {
  response: Pack[]
}

export interface Packs$create {
  request: { body: PackInput }
  response: Pack
}

export interface Cycles$findAll {
  response: Cycle[]
}

export interface Cycles$create {
  request: { body: CycleInput }
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

// The decks of the logged-in user
export interface Decks$findForUser {
  response: DeckWithVersions[]
}

export interface Decks$delete {
  request: { params: { deckId: string } }
}

export interface Decklists$create {
  // The server sets id, created_at and the owner; publishing has its own endpoint
  request: { body: Omit<Decklist, 'id' | 'created_at' | 'owner_id' | 'published_date'> }
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
  response: PublishedDecklistWithExtraInfo[]
}

export interface Decklists$publish {
  request: { params: { decklistId: string } }
  response: Decklist
}

export interface Decklists$unpublish {
  request: { params: { decklistId: string } }
  response: Decklist
}

export interface Ruling$findAll {
  response: Ruling[]
}

export interface Ruling$create {
  request: { body: Omit<Ruling, 'id'> }
  response: Ruling
}

export interface Ruling$update {
  request: { params: { rulingId: string }; body: Ruling }
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
      // Optional, so exports from instances without traits in the export still import
      traits?: Trait[]
    }
  }
}

export interface Pack$export {
  request: { params: { id: string } }
  response: {
    pack: Pack
    cards: Card[]
    cardsInPack: CardInPack[]
    // The traits of the pack's cards, so new traits are imported with the pack
    traits: Trait[]
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

export interface Traits$findAll {
  response: Trait[]
}

// Public client configuration, read from the server's environment
export interface Config$auth0 {
  response: { domain: string; clientId: string }
}

export interface Config$betaUrl {
  response: { betaUrl: string }
}
