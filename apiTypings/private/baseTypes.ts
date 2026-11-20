export interface Card {
  id: string
  name: string
  name_extra?: string | undefined
  faction: string
  side: string
  type: string
  is_unique: boolean
  role_restrictions: string[]
  text?: string | undefined
  restricted_in?: string[] | undefined
  banned_in?: string[] | undefined
  splash_banned_in?: string[] | undefined
  allowed_clans?: string[] | undefined
  traits?: string[] | undefined
  cost?: string | undefined
  deck_limit: number
  influence_cost?: number | undefined
  // Province Card Info
  elements?: string[] | undefined
  strength?: string | undefined
  // Stronghold Card Info
  glory?: number | undefined
  fate?: number | undefined
  honor?: number | undefined
  influence_pool?: number | undefined
  // Holding Card Info
  strength_bonus?: string | undefined
  // Character Card Info
  military?: string | undefined
  political?: string | undefined
  // Attachment Card Info
  military_bonus?: string | undefined
  political_bonus?: string | undefined
}

export interface Ruling {
  id: number
  card_id: string
  text: string
  source: string
  link: string
}

export interface Pack {
  id: string
  name: string
  position: number
  size: number
  released_at?: Date | undefined
  publisher_id?: string | undefined
  cycle_id: string
  rotated: boolean
}

export interface CardInPack {
  card_id: string
  pack_id: string
  flavor?: string | undefined
  illustrator?: string | undefined
  image_url?: string | undefined
  position?: string | undefined
  quantity?: number | undefined
  rotated: boolean
}

export interface Cycle {
  id: string
  name: string
  position: number
  size: number
  rotated: boolean
  publisher: 'ffg' | 'emerald-legacy'
}

export interface Trait {
  id: string
  name: string
}

export interface RoleRestriction {
  id: string
  name: string
}

export interface Format {
  id: string
  name: string
  legal_packs?: string[]
  supported: boolean
  position: number
  maintainer?: string
  description?: string
  info_link?: string
}

export interface User {
  // The Auth0 id. Only ever sent to the user themselves (/users/me), never in public responses
  id: string
  // Stands for the user in public responses (owner_id, author_id); reveals nothing about the account
  public_id: string
  name: string
  roles: string[]
}

export interface Deck {
  id: string
  // The public_id of the user who owns the deck
  owner_id: string
  forked_from?: string | undefined
}

export interface Decklist {
  id: string
  deck_id: string
  format: string
  name: string
  primary_clan?: string | undefined
  secondary_clan?: string | undefined
  description?: string | undefined
  version_number: string
  cards: Record<string, number>
  card_pack_ids?: Record<string, string> | undefined
  published_date?: Date | undefined
  created_at: Date
  // The public_id of the user who owns the deck
  owner_id: string
}

export interface DecklistComment {
  id: string
  decklist_id: string
  parent_comment_id?: string
  // The public_id of the user who wrote the comment
  author_id: string
  comment: string
  created_at: Date
  edited_at?: Date
}
