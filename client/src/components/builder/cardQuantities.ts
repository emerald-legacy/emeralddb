/**
 * The cards of a deck with one card's quantity changed, as a new object: the deck list and
 * the card picker share the cards, and changing them in place hid changes from React.
 * A quantity of 0 removes the card.
 */
export function withCardQuantity(
  cards: Record<string, number>,
  cardId: string,
  quantity: number
): Record<string, number> {
  const { [cardId]: _previousQuantity, ...otherCards } = cards
  return quantity > 0 ? { ...otherCards, [cardId]: quantity } : otherCards
}
