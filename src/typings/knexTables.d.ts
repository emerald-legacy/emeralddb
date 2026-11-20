import type { Knex } from 'knex'
import type {
  Card,
  CardInPack,
  Cycle,
  Deck,
  Decklist,
  DecklistComment,
  Format,
  Pack,
  Ruling,
  Trait,
  User,
} from '@5rdb/api'

/**
 * The row types of the database tables. This is the server's trust boundary:
 * Knex returns whatever the database sends, and these declarations say what
 * that is. Keep them in line with the migrations.
 *
 * Known mismatch: nullable columns come back as `null`, while the API types
 * declare them as optional (`?: T | undefined`).
 */
declare module 'knex/types/tables' {
  interface Tables {
    cards: Card
    cards_in_packs: CardInPack
    cycles: Cycle
    decks: Deck
    decklists: Knex.CompositeTableType<
      Decklist,
      Decklist,
      // unpublishDecklist resets published_date to NULL
      Partial<Omit<Decklist, 'published_date'>> & { published_date?: Date | null }
    >
    decklist_comments: DecklistComment
    formats: Format
    // size isn't stored, getAllPacks/getPack compute it from cards_in_packs
    packs: Omit<Pack, 'size'>
    rulings: Ruling
    traits: Trait
    users: User
  }
}
