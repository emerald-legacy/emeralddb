import { Card, Trait } from '@5rdb/api'
import { getAllTraits } from '../../gateways/storage'
import { FORMATS, FACTIONS, CLANS, ELEMENTS } from '../../model/enums'

export async function validateCardInput(card: Card): Promise<string[]> {
  const errors: string[] = []
  const traits: Trait[] = await getAllTraits()

  if (!FACTIONS.find((faction) => faction === card.faction)) {
    errors.push(`Unknown faction ${card.faction} in field 'faction'`)
  }
  card.allowed_clans
    ?.filter((allowedClan) => !CLANS.find((clan) => clan === allowedClan))
    .forEach((allowedClan) => errors.push(`Unknown clan ${allowedClan} in field 'allowed_clans'`))
  card.elements
    ?.filter((inputElement) => !ELEMENTS.find((element) => element === inputElement))
    .forEach((inputElement) => errors.push(`Unknown element ${inputElement} in field 'elements'`))
  card.traits
    ?.filter((inputTrait) => !traits.find((trait) => trait.id === inputTrait))
    .forEach((inputTrait) => errors.push(`Unknown trait ${inputTrait} in field 'traits'`))
  card.banned_in
    ?.filter((inputFormat) => !FORMATS.find((format) => format === inputFormat))
    .forEach((inputFormat) => errors.push(`Unknown format ${inputFormat} in field 'banned_in'`))
  card.restricted_in
    ?.filter((inputFormat) => !FORMATS.find((format) => format === inputFormat))
    .forEach((inputFormat) => errors.push(`Unknown format ${inputFormat} in field 'restricted_in'`))
  card.splash_banned_in
    ?.filter((inputFormat) => !FORMATS.find((format) => format === inputFormat))
    .forEach((inputFormat) =>
      errors.push(`Unknown format ${inputFormat} in field 'splash_banned_in'`)
    )

  if (card.side === 'role' && !['role'].includes(card.type)) {
    errors.push(`Card type ${card.type} is not allowed for side 'role'`)
  }
  if (card.side === 'province' && !['stronghold', 'province', 'warlord'].includes(card.type)) {
    errors.push(`Card type ${card.type} is not allowed for side 'province'`)
  }
  if (card.side === 'treaty' && !['treaty'].includes(card.type)) {
    errors.push(`Card type ${card.type} is not allowed for side 'treaty'`)
  }
  if (card.side === 'conflict' && !['event', 'character', 'attachment'].includes(card.type)) {
    errors.push(`Card type ${card.type} is not allowed for side 'conflict'`)
  }
  if (card.side === 'dynasty' && !['event', 'character', 'holding'].includes(card.type)) {
    errors.push(`Card type ${card.type} is not allowed for side 'dynasty'`)
  }

  if (card.side === 'conflict') {
    if (
      card.faction === 'shadowlands' &&
      card.influence_cost !== undefined &&
      card.influence_cost !== null
    ) {
      errors.push(`A shadowlands conflict card cannot have a value in 'influence_cost'`)
    }
    if (card.faction === 'neutral' && card.influence_cost !== 0) {
      errors.push(`A neutral conflict card must have an 'influence_cost' of 0`)
    }
    if (card.faction !== 'shadowlands' && card.faction !== 'neutral') {
      if (card.influence_cost === 0) {
        errors.push(`A clan conflict card cannot have an 'incluence_cost' of 0`)
      }
      if (
        (card.influence_cost === undefined || card.influence_cost === null) &&
        (card.allowed_clans?.length !== 1 || card.allowed_clans[0] !== card.faction)
      ) {
        errors.push(
          `An unsplashable clan conflict card must have only the own clan in 'allowed_clans'`
        )
      }
      if (card.influence_cost && card.influence_cost < 0) {
        errors.push(`A splashable clan conflict card must have an 'influence_cost' > 0`)
      }
    }
  }

  if (card.faction === 'shadowlands') {
    if (card.allowed_clans && card.allowed_clans.length > 0) {
      errors.push(`The field 'allowed_clans' cannot be set on shadowlands cards`)
    }
  } else {
    if (!card.allowed_clans) {
      errors.push(`The field 'allowed_clans' must be set on non-shadowlands cards`)
    } else if (card.side !== 'conflict' && card.faction !== 'neutral') {
      if (card.allowed_clans.length > 1 || card.allowed_clans[0] !== card.faction) {
        errors.push(
          `The field 'allowed_clans' can only contain the card's faction on non-conflict cards`
        )
      }
    }
  }

  if (card.type === 'character') {
    if (!card.glory && card.glory !== 0) {
      errors.push(`The field 'glory' is required on card type 'character'`)
    }
  }
  if (card.type === 'attachment') {
    if (!card.military_bonus) {
      errors.push(`The field 'military_bonus' is required on card type 'attachment'`)
    }
    if (!card.political_bonus) {
      errors.push(`The field 'political_bonus' is required on card type 'attachment'`)
    }
  }
  if (card.type === 'stronghold') {
    if (!card.fate) {
      errors.push(`The field 'fate' is required on card type 'stronghold'`)
    }
    if (!card.influence_pool) {
      errors.push(`The field 'influence_pool' is required on card type 'stronghold'`)
    }
    if (!card.honor) {
      errors.push(`The field 'honor' is required on card type 'stronghold'`)
    }
    if (!card.strength_bonus) {
      errors.push(`The field 'strength_bonus' is required on card type 'stronghold'`)
    }
  }
  if (card.type === 'holding') {
    if (!card.strength_bonus) {
      errors.push(`The field 'strength_bonus' is required on card type 'stronghold'`)
    }
  }
  if (card.type === 'province') {
    if (!card.strength) {
      errors.push(`The field 'strength_bonus' is required on card type 'province'`)
    }
    if (!card.elements) {
      errors.push(`The field 'elements' is required on card type 'province'`)
    }
  }
  if (card.type === 'event') {
    if (!card.cost) {
      errors.push(`The field 'cost' is required on card type 'event'`)
    }
  }
  if (card.type === 'warlord') {
    if (!card.cost) {
      errors.push(`The field 'cost' is required on card type 'warlord'`)
    }
    if (!card.fate) {
      errors.push(`The field 'fate' is required on card type 'warlord'`)
    }
    if (!card.glory && card.glory !== 0) {
      errors.push(`The field 'glory' is required on card type 'warlord'`)
    }
  }

  return errors
}
