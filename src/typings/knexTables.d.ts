import type { Knex } from 'knex'
import type {
  Card,
  CardInput,
  CardInPack,
  Cycle,
  CycleInput,
  Deck,
  Decklist,
  DecklistComment,
  Format,
  FormatInput,
  Pack,
  PackInput,
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
 * declare them as optional (`?: T | undefined`). Inserts and updates use the
 * *Input types from the API, which allow `null` to clear a column.
 *
 * CompositeTableType<Select, Insert, Update>
 */
declare module 'knex/types/tables' {
  interface Tables {
    cards: Knex.CompositeTableType<Card, CardInput, Partial<CardInput>>
    cards_in_packs: CardInPack
    // rotated has a database default of false
    cycles: Knex.CompositeTableType<Cycle, CycleInput & { rotated?: boolean }, Partial<Cycle>>
    // Owners never change: the update types leave out owner_id and author_id
    decks: Knex.CompositeTableType<Deck, Deck, Partial<Omit<Deck, 'id' | 'owner_id'>>>
    decklists: Knex.CompositeTableType<
      Decklist,
      Decklist,
      // unpublishDecklist resets published_date to NULL
      Partial<Omit<Decklist, 'id' | 'deck_id' | 'owner_id' | 'published_date'>> & {
        published_date?: Date | null
      }
    >
    decklist_comments: Knex.CompositeTableType<
      DecklistComment,
      DecklistComment,
      Partial<Pick<DecklistComment, 'comment' | 'edited_at'>>
    >
    formats: Knex.CompositeTableType<Format, FormatInput, Partial<FormatInput>>
    // size isn't stored, getAllPacks/getPack compute it from cards_in_packs
    packs: Knex.CompositeTableType<
      Omit<Pack, 'size'>,
      Omit<PackInput, 'size'>,
      Partial<Omit<PackInput, 'size'>>
    >
    rulings: Ruling
    traits: Trait
    // public_id has a database default (gen_random_uuid()) and never changes.
    // Known mismatch: name and roles are nullable columns.
    users: Knex.CompositeTableType<
      User,
      Omit<User, 'public_id'>,
      Partial<Omit<User, 'id' | 'public_id'>>
    >
  }
}
