import { Card, CardInPack, Deck, Decklist, DecklistComment, Ruling } from './baseTypes'

export type CardWithVersions = Card & {
  versions: Omit<CardInPack, 'card_id'>[]
}

export type CardWithDetails = CardWithVersions & {
  rulings: Ruling[]
}

export type DeckWithVersions = Deck & {
  versions: DecklistWithExtraInfo[]
  forkedFrom?: Decklist
}

export type DecklistWithUser = Decklist & {
  username: string
}

export type DecklistViewModel = Omit<
  Decklist,
  'deck_id' | 'created_at' | 'published_date' | 'owner_id'
>

/** A card by id and name, for lists that only show its name */
export type CardReference = Pick<Card, 'id' | 'name'>

/** A decklist in the public deck list: a summary without its cards */
export type PublishedDecklist = Pick<
  DecklistWithUser,
  | 'id'
  | 'username'
  | 'name'
  | 'format'
  | 'primary_clan'
  | 'secondary_clan'
  | 'published_date'
  | 'version_number'
>

export type DecklistCommentWithUser = DecklistComment & {
  username: string
}

export type DecklistWithExtraInfo = Decklist & {
  stronghold?: Card
  role?: Card
}

export type PublishedDecklistWithExtraInfo = PublishedDecklist & {
  stronghold?: CardReference
  role?: CardReference
}
