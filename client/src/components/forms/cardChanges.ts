import type { Card, CardInput } from '@5rdb/api'

export interface FieldChange {
  fieldId: string
  old: string
  new: string
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '{null}'
  }
  if (Array.isArray(value)) {
    return value.map(String).join(',')
  }
  return String(value)
}

/**
 * The fields whose value the edited card changes, for the confirmation before saving.
 * It goes through every field that is sent, so a field can't be left out of the list.
 * Values are compared as displayed, so arrays are compared by their contents.
 */
export function changedFields(original: Card, edited: CardInput): FieldChange[] {
  const originalValues = new Map<string, unknown>(Object.entries(original))
  return Object.entries(edited).flatMap(([fieldId, value]) => {
    const change = {
      fieldId,
      old: displayValue(originalValues.get(fieldId)),
      new: displayValue(value),
    }
    return change.old === change.new ? [] : [change]
  })
}
