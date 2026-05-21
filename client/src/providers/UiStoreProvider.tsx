import { Pack, Cycle, Trait, CardWithVersions, Format, CardInPack } from '@5rdb/api'
import { createContext, ReactNode, useContext, useMemo, type JSX } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '../api'

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

// Helper function to fetch data with cache-busting
async function fetchWithCacheBusting<T>(endpoint: string): Promise<T> {
  const timestamp = Date.now()
  const response = await fetch(`${endpoint}?_t=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
  return (await response.json()) as T
}

export function UiStoreProvider(props: { children: ReactNode }): JSX.Element {
  const queryClient = useQueryClient()

  // Use TanStack Query for all data fetching with automatic caching
  const { data: cards = [] } = useQuery<CardWithVersions[]>({
    queryKey: UiStoreQueries.CARDS,
    queryFn: () => fetchWithCacheBusting<CardWithVersions[]>('/api/cards'),
  })

  const { data: packs = [] } = useQuery<Pack[]>({
    queryKey: UiStoreQueries.PACKS,
    queryFn: () => fetchWithCacheBusting<Pack[]>('/api/packs'),
  })

  const { data: cycles = [] } = useQuery<Cycle[]>({
    queryKey: UiStoreQueries.CYCLES,
    queryFn: () => fetchWithCacheBusting<Cycle[]>('/api/cycles'),
  })

  const { data: traits = [] } = useQuery<Trait[]>({
    queryKey: UiStoreQueries.TRAITS,
    queryFn: () => fetchWithCacheBusting<Trait[]>('/api/traits'),
  })

  const { data: formats = [], isLoading: formatsLoading } = useQuery<Format[]>({
    queryKey: UiStoreQueries.FORMATS,
    queryFn: () => fetchWithCacheBusting<Format[]>('/api/formats'),
  })

  // Compute relevant formats
  const relevantFormats = useMemo(() => formats.filter((format) => format.supported), [formats])

  // Check if any query is loading
  const isLoading = formatsLoading

  // Replace toggleReload with query invalidation
  const invalidateData = async () => {
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
      {props.children}
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
