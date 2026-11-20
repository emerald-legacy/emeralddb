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
  stronghold?: Card
  role?: Card
}
