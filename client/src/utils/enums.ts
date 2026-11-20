export const cardTypes: { id: string; name: string }[] = [
  { id: 'character', name: 'Character' },
  { id: 'event', name: 'Event' },
  { id: 'attachment', name: 'Attachment' },
  { id: 'holding', name: 'Holding' },
  { id: 'province', name: 'Province' },
  { id: 'stronghold', name: 'Stronghold' },
  { id: 'role', name: 'Role' },
  { id: 'warlord', name: 'Warlord' },
  { id: 'treaty', name: 'Treaty' },
]

export const sides: { id: string; name: string }[] = [
  { id: 'dynasty', name: 'Dynasty' },
  { id: 'conflict', name: 'Conflict' },
  { id: 'province', name: 'Province' },
  { id: 'role', name: 'Role' },
  { id: 'treaty', name: 'Treaty' },
]

export const roleRestrictions: { id: string; name: string }[] = [
  { id: 'air', name: 'Air' },
  { id: 'earth', name: 'Earth' },
  { id: 'fire', name: 'Fire' },
  { id: 'void', name: 'Void' },
  { id: 'water', name: 'Water' },
  { id: 'keeper', name: 'Keeper' },
  { id: 'seeker', name: 'Seeker' },
]

export const elements: { id: string; name: string }[] = [
  { id: 'air', name: 'Air' },
  { id: 'earth', name: 'Earth' },
  { id: 'fire', name: 'Fire' },
  { id: 'void', name: 'Void' },
  { id: 'water', name: 'Water' },
]

export const factions: { id: string; name: string; color: string }[] = [
  { id: 'crab', name: 'Crab', color: '#163078' },
  { id: 'crane', name: 'Crane', color: '#44c2bc' },
  { id: 'dragon', name: 'Dragon', color: '#1d6922' },
  { id: 'lion', name: 'Lion', color: '#dece23' },
  //{ id: 'mantis', name: 'Mantis', color: '#2c8369' },
  { id: 'phoenix', name: 'Phoenix', color: '#de9923' },
  { id: 'scorpion', name: 'Scorpion', color: '#ab1916' },
  { id: 'unicorn', name: 'Unicorn', color: '#90119e' },
  { id: 'neutral', name: 'Neutral', color: '#b1b1b1' },
  { id: 'shadowlands', name: 'Shadowlands', color: '#000000' },
]

export const clans: { id: string; name: string }[] = [
  { id: 'crab', name: 'Crab' },
  { id: 'crane', name: 'Crane' },
  { id: 'dragon', name: 'Dragon' },
  { id: 'lion', name: 'Lion' },
  //{ id: 'mantis', name: 'Mantis' },
  { id: 'phoenix', name: 'Phoenix' },
  { id: 'scorpion', name: 'Scorpion' },
  { id: 'unicorn', name: 'Unicorn' },
]

export function typesInSide(side: string): string[] {
  if (side === 'treaty') {
    return ['treaty']
  }
  if (side === 'role') {
    return ['role']
  }
  if (side === 'province') {
    return ['stronghold', 'province', 'warlord']
  }
  if (side === 'dynasty') {
    return ['character', 'holding', 'event']
  }
  if (side === 'conflict') {
    return ['event', 'attachment', 'character']
  }
  return []
}

export function sidesForType(type: string): string[] {
  if (type === 'treaty') {
    return ['treaty']
  }
  if (type === 'role') {
    return ['role']
  }
  if (type === 'province') {
    return ['province']
  }
  if (type === 'stronghold') {
    return ['province']
  }
  if (type === 'character') {
    return ['conflict', 'dynasty']
  }
  if (type === 'event') {
    return ['conflict', 'dynasty']
  }
  if (type === 'holding') {
    return ['dynasty']
  }
  if (type === 'attachment') {
    return ['conflict']
  }
  if (type === 'warlord') {
    return ['province']
  }
  return []
}
