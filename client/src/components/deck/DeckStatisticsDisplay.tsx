import { CardWithVersions, Pack, Trait, CardInPack } from '@5rdb/api'
import { Box, Grid, Paper, Typography, List, ListItem } from '@mui/material'
import { useState, type JSX } from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import { StatisticChartCard } from './StatisticChartCard'
import { useUiStore } from '../../providers/UiStoreProvider'

interface DeckStatisticsDisplayProps {
  cards: Record<string, number>
  allCards: CardWithVersions[]
  allPacks: Pack[]
  format: string
  cardPackIds?: Record<string, string>
}

function calculateRequiredPacks(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  allPacks: Pack[],
  format: string,
  validCardVersionForFormat: (
    cardId: string,
    format: string
  ) => Omit<CardInPack, 'card_id'> | undefined,
  cardPackIds?: Record<string, string>
): { packName: string; count: number }[] {
  const packCountMap = new Map<string, number>() // Map<packId, count>

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card) {
      const packId = cardPackIds?.[cardId] || validCardVersionForFormat(card.id, format)?.pack_id
      if (packId) {
        const currentCount = packCountMap.get(packId) || 0
        packCountMap.set(packId, currentCount + quantity)
      }
    }
  })

  const requiredPacks: { packName: string; count: number }[] = []
  packCountMap.forEach((count, packId) => {
    const pack = allPacks.find((p) => p.id === packId)
    if (pack) {
      requiredPacks.push({ packName: pack.name, count })
    }
  })

  requiredPacks.sort((a, b) => a.packName.localeCompare(b.packName))

  return requiredPacks
}

function calculateTraitCounts(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  allTraits: Trait[],
  side: 'dynasty' | 'conflict'
): { trait: string; count: number }[] {
  const traitMap = new Map<string, number>()

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card && card.side === side && card.traits) {
      card.traits.forEach((trait) => {
        const currentCount = traitMap.get(trait) || 0
        traitMap.set(trait, currentCount + quantity)
      })
    }
  })

  const distribution = Array.from(traitMap.entries())
    .map(([traitId, count]) => ({
      trait: allTraits.find((t) => t.id === traitId)?.name || traitId,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return distribution
}

function calculateAverageFateCostForDeck(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  deckSide: 'dynasty' | 'conflict'
): number {
  let totalCost = 0
  let totalCards = 0

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card && card.side === deckSide && card.cost !== undefined && card.cost !== null) {
      const cost = card.cost === 'X' ? 0 : parseInt(card.cost)
      totalCost += cost * quantity
      totalCards += quantity
    }
  })

  return totalCards > 0 ? totalCost / totalCards : 0
}

function calculateStatDistribution(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  statType: 'military' | 'political' | 'glory'
): { value: string; count: number }[] {
  const statMap = new Map<string, number>()
  let maxStat = 0
  let minStat = Infinity

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card && card.type === 'character') {
      const rawValue = card[statType]
      if (rawValue === null || rawValue === undefined || rawValue === '-') {
        return
      }
      const stat = typeof rawValue === 'number' ? rawValue : parseInt(rawValue.toString())
      statMap.set(stat.toString(), (statMap.get(stat.toString()) || 0) + quantity)
      if (stat > maxStat) {
        maxStat = stat
      }
      if (stat < minStat) {
        minStat = stat
      }
    }
  })

  const distribution: { value: string; count: number }[] = []
  const startStat = minStat === Infinity ? 0 : minStat
  for (let i = startStat; i <= maxStat; i++) {
    distribution.push({ value: i.toString(), count: statMap.get(i.toString()) || 0 })
  }

  return distribution
}

function calculateFateCostDistributionForDeck(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  deckSide: 'dynasty' | 'conflict'
): { value: string; count: number }[] {
  const costMap = new Map<string, number>()
  let maxCost = 0

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card && card.side === deckSide && card.cost !== undefined && card.cost !== null) {
      const cost = card.cost === 'X' ? 0 : parseInt(card.cost)
      costMap.set(cost.toString(), (costMap.get(cost.toString()) || 0) + quantity)
      if (cost > maxCost) {
        maxCost = cost
      }
    }
  })

  const distribution: { value: string; count: number }[] = []
  const startCost = costMap.has('0') ? 0 : 1
  for (let i = startCost; i <= maxCost; i++) {
    distribution.push({ value: i.toString(), count: costMap.get(i.toString()) || 0 })
  }

  return distribution
}

function calculateAverageStat(
  cards: Record<string, number>,
  allCards: CardWithVersions[],
  statType: 'military' | 'political' | 'glory'
): number {
  let totalStat = 0
  let totalCards = 0

  Object.entries(cards).forEach(([cardId, quantity]) => {
    const card = allCards.find((c) => c.id === cardId)
    if (card && card.type === 'character') {
      const rawValue = card[statType]
      if (rawValue !== null && rawValue !== undefined && rawValue !== '-') {
        const stat = typeof rawValue === 'number' ? rawValue : parseInt(rawValue.toString())
        totalStat += stat * quantity
        totalCards += quantity
      }
    }
  })

  return totalCards > 0 ? totalStat / totalCards : 0
}

export function DeckStatisticsDisplay({
  cards,
  allCards,
  allPacks,
  format,
  cardPackIds,
}: DeckStatisticsDisplayProps): JSX.Element {
  const { traits, validCardVersionForFormat } = useUiStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isConflictTraitsExpanded, setIsConflictTraitsExpanded] = useState(false)

  const militaryPowerDistribution = calculateStatDistribution(cards, allCards, 'military')
  const averageMilitaryPower = calculateAverageStat(cards, allCards, 'military')

  const politicalPowerDistribution = calculateStatDistribution(cards, allCards, 'political')
  const averagePoliticalPower = calculateAverageStat(cards, allCards, 'political')

  const gloryDistribution = calculateStatDistribution(cards, allCards, 'glory')
  const averageGlory = calculateAverageStat(cards, allCards, 'glory')

  const dynastyTraitCounts = calculateTraitCounts(cards, allCards, traits, 'dynasty')
  const conflictTraitCounts = calculateTraitCounts(cards, allCards, traits, 'conflict')

  const dynastyFateCost = calculateFateCostDistributionForDeck(cards, allCards, 'dynasty')
  const conflictFateCost = calculateFateCostDistributionForDeck(cards, allCards, 'conflict')

  const averageDynastyFateCost = calculateAverageFateCostForDeck(cards, allCards, 'dynasty')
  const averageConflictFateCost = calculateAverageFateCostForDeck(cards, allCards, 'conflict')

  const requiredPacks = calculateRequiredPacks(
    cards,
    allCards,
    allPacks,
    format,
    validCardVersionForFormat,
    cardPackIds
  )

  return (
    <Box p={1}>
      <Grid container spacing={2} alignItems="stretch">
        <StatisticChartCard
          title="Dynasty Fate Cost"
          averageValue={averageDynastyFateCost}
          data={dynastyFateCost}
          dataKey="value"
          color="#1b5e20"
          noDataMessage="No dynasty cards with fate cost in deck"
        />
        <StatisticChartCard
          title="Conflict Fate Cost"
          averageValue={averageConflictFateCost}
          data={conflictFateCost}
          dataKey="value"
          color="#4CAF50"
          noDataMessage="No conflict cards with fate cost in deck"
        />
        <StatisticChartCard
          title="Military Power"
          averageValue={averageMilitaryPower}
          data={militaryPowerDistribution}
          dataKey="value"
          color="#7D2900"
          noDataMessage="No characters with military power in deck"
        />
        <StatisticChartCard
          title="Political Power"
          averageValue={averagePoliticalPower}
          data={politicalPowerDistribution}
          dataKey="value"
          color="#282877"
          noDataMessage="No characters with political power in deck"
        />
        <StatisticChartCard
          title="Glory"
          averageValue={averageGlory}
          data={gloryDistribution}
          dataKey="value"
          color="#F9A825"
          noDataMessage="No characters with glory in deck"
        />
        <Grid size={12} sx={{ display: { xs: 'none', sm: 'block' } }} />
        <Grid size={{ xs: 12, sm: 6 }} component="div">
          <Paper elevation={2} sx={{ p: 1, minHeight: '192px' }}>
            <Typography variant="h6" gutterBottom align="center">
              {isExpanded ? 'All Dynasty Traits' : 'Top 5 Dynasty Traits'}
            </Typography>
            <List dense>
              {(isExpanded ? dynastyTraitCounts : dynastyTraitCounts.slice(0, 5)).map(
                ({ trait, count }) => (
                  <ListItem key={trait} sx={{ py: 0 }}>
                    <strong>{trait}</strong>: {count}
                  </ListItem>
                )
              )}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {dynastyTraitCounts.length > 5 && !isExpanded && (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => setIsExpanded(true)}
                  sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Expand Traits
                </Typography>
              )}
              {isExpanded && (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => setIsExpanded(false)}
                  sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Collapse Traits
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} component="div">
          <Paper elevation={2} sx={{ p: 1, minHeight: '192px' }}>
            <Typography variant="h6" gutterBottom align="center">
              {isConflictTraitsExpanded ? 'All Conflict Traits' : 'Top 5 Conflict Traits'}
            </Typography>
            <List dense>
              {(isConflictTraitsExpanded
                ? conflictTraitCounts
                : conflictTraitCounts.slice(0, 5)
              ).map(({ trait, count }) => (
                <ListItem key={trait} sx={{ py: 0 }}>
                  <strong>{trait}</strong>: {count}
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {conflictTraitCounts.length > 5 && !isConflictTraitsExpanded && (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => setIsConflictTraitsExpanded(true)}
                  sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Expand Conflict Traits
                </Typography>
              )}
              {isConflictTraitsExpanded && (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => setIsConflictTraitsExpanded(false)}
                  sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Collapse Conflict Traits
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={12} component="div">
          <Paper elevation={2} sx={{ p: 1, minHeight: '192px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Required Packs
            </Typography>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
              {requiredPacks.map(({ packName }) => (
                <li key={packName}>
                  <strong>{packName}</strong>
                </li>
              ))}
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
