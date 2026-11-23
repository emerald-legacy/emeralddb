import { Pack, Cycle, Trait, CardWithVersions, Format, CardInPack } from '@5rdb/api'
import { createContext, ReactNode, useContext, useMemo, type JSX } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Button, Typography } from '@mui/material'
import { errorMessage, publicApi, refreshCache } from '../api'

export interface UiStore {
  cards: CardWithVersions[]
  packs: Pack[]
  cycles: Cycle[]
  traits: Trait[]
  formats: Format[]
  relevantFormats: Format[]
  validCardVersionForFormat: (
    cardId: string,
    formatId: string
  ) => Omit<CardInPack, 'card_id'> | undefined
  invalidateData: () => Promise<void>
  isLoading: boolean
}

export const UiStoreContext = createContext<UiStore>({
  cards: [],
  packs: [],
  cycles: [],
  traits: [],
  formats: [],
  relevantFormats: [],
  validCardVersionForFormat: () => undefined,
  invalidateData: async () => {},
  isLoading: false,
})

// Query keys for TanStack Query
export const UiStoreQueries = {
  CARDS: ['cards'] as const,
  PACKS: ['packs'] as const,
  CYCLES: ['cycles'] as const,
  TRAITS: ['traits'] as const,
  FORMATS: ['formats'] as const,
  PUBLISHED_DECKLISTS: ['published-decklists'] as const,
}

export function UiStoreProvider(props: { children: ReactNode }): JSX.Element {
  const queryClient = useQueryClient()

  // Use TanStack Query for all data fetching with automatic caching. The API calls
  // reject for an error status, so a failed load is an error and not empty data.
  const cardsQuery = useQuery({
    queryKey: UiStoreQueries.CARDS,
    queryFn: () => publicApi.Card.findAll().then((response) => response.data()),
  })
  const packsQuery = useQuery({
    queryKey: UiStoreQueries.PACKS,
    queryFn: () => publicApi.Pack.findAll().then((response) => response.data()),
  })
  const cyclesQuery = useQuery({
    queryKey: UiStoreQueries.CYCLES,
    queryFn: () => publicApi.Cycle.findAll().then((response) => response.data()),
  })
  const traitsQuery = useQuery({
    queryKey: UiStoreQueries.TRAITS,
    queryFn: () => publicApi.Trait.findAll().then((response) => response.data()),
  })
  const formatsQuery = useQuery({
    queryKey: UiStoreQueries.FORMATS,
    queryFn: () => publicApi.Format.findAll().then((response) => response.data()),
  })
  const queries = [cardsQuery, packsQuery, cyclesQuery, traitsQuery, formatsQuery]
  const cards = cardsQuery.data ?? []
  const packs = packsQuery.data ?? []
  const cycles = cyclesQuery.data ?? []
  const traits = traitsQuery.data ?? []
  const formats = formatsQuery.data ?? []
  const formatsLoading = formatsQuery.isLoading
  // Data that couldn't be loaded at all; a failed refetch keeps the data it had
  const failedQuery = queries.find((query) => query.error && query.data === undefined)

  // Compute relevant formats
  const relevantFormats = useMemo(() => formats.filter((format) => format.supported), [formats])

  // Check if any query is loading
  const isLoading = formatsLoading

  // Refresh the browser cache first, so the refetches below get the fresh data
  const invalidateData = async () => {
    await refreshCache('/cards', '/packs', '/cycles', '/traits', '/formats')

    queryClient.invalidateQueries({ queryKey: UiStoreQueries.CARDS })
    queryClient.invalidateQueries({ queryKey: UiStoreQueries.PACKS })
    queryClient.invalidateQueries({ queryKey: UiStoreQueries.CYCLES })
    queryClient.invalidateQueries({ queryKey: UiStoreQueries.TRAITS })
    queryClient.invalidateQueries({ queryKey: UiStoreQueries.FORMATS })

    await Promise.all([
      queryClient.refetchQueries({ queryKey: UiStoreQueries.CARDS, exact: true }),
      queryClient.refetchQueries({ queryKey: UiStoreQueries.PACKS, exact: true }),
      queryClient.refetchQueries({ queryKey: UiStoreQueries.CYCLES, exact: true }),
      queryClient.refetchQueries({ queryKey: UiStoreQueries.TRAITS, exact: true }),
      queryClient.refetchQueries({ queryKey: UiStoreQueries.FORMATS, exact: true }),
    ])
  }

  // Memoized cache for card version lookups - O(1) instead of O(n)
  const cardVersionCache = useMemo(() => {
    const cache = new Map<string, Map<string, Omit<CardInPack, 'card_id'>>>()

    // Build lookup table for each format
    formats.forEach((format) => {
      const formatCache = new Map<string, Omit<CardInPack, 'card_id'>>()
      const legalPacks = format.legal_packs || []

      cards.forEach((card) => {
        const validVersion = card.versions.find((v) => legalPacks.includes(v.pack_id))
        if (validVersion) {
          formatCache.set(card.id, validVersion)
        }
      })

      cache.set(format.id, formatCache)
    })

    return cache
  }, [cards, formats])

  const validCardVersionForFormat = (cardId: string, formatId: string) => {
    const formatCache = cardVersionCache.get(formatId)
    if (!formatCache) {
      return undefined
    }
    return formatCache.get(cardId)
  }

  return (
    <UiStoreContext.Provider
      value={{
        cards,
        packs,
        cycles,
        traits,
        formats,
        relevantFormats,
        validCardVersionForFormat,
        invalidateData,
        isLoading,
      }}
    >
      {failedQuery ? (
        // Every page needs this data; without it, they would show a spinner forever
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            EmeraldDB couldn't load its card data
          </Typography>
          <Typography gutterBottom>{errorMessage(failedQuery.error)}</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              queries.filter((query) => query.error).forEach((query) => query.refetch())
            }
          >
            Try again
          </Button>
        </Box>
      ) : (
        props.children
      )}
    </UiStoreContext.Provider>
  )
}

export function useUiStore(): UiStore {
  const uiStore = useContext(UiStoreContext)
  if (uiStore === undefined) {
    throw new Error('Context must be used within a Provider')
  }
  return uiStore
}
