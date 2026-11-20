import { getUserNames } from '../gateways/storage'

// For users without a name (users.name is nullable)
const UNKNOWN_USER = 'Unknown user'

/**
 * Adds the name of each item's user, looked up with one query for all items.
 * `publicIdField` names the field that holds the user's public id, e.g. 'owner_id'.
 */
export async function withUsernames<
  PublicIdField extends string,
  Item extends Record<PublicIdField, string>,
>(items: Item[], publicIdField: PublicIdField): Promise<(Item & { username: string })[]> {
  if (items.length === 0) {
    return []
  }
  const names = await getUserNames(items.map((item) => item[publicIdField]))
  return items.map((item) => ({
    ...item,
    username: names.get(item[publicIdField]) ?? UNKNOWN_USER,
  }))
}

/** Adds the name of the item's user, see withUsernames */
export async function withUsername<
  PublicIdField extends string,
  Item extends Record<PublicIdField, string>,
>(item: Item, publicIdField: PublicIdField): Promise<Item & { username: string }> {
  const [itemWithUsername] = await withUsernames([item], publicIdField)
  return itemWithUsername
}
