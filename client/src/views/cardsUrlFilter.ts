import type { Pack } from '@5rdb/api'

/** The card filter from the URL of the cards view: ?cycle=, ?pack= and ?query= */
export function createFilterFromUrlSearchParams<
  Filter extends { text: string; packs: string[]; cycles: string[] },
>(params: URLSearchParams, allPacks: Pack[], initialFilter: Filter): Filter {
  const cycle = params.get('cycle')
  const pack = params.get('pack')
  const query = params.get('query') || ''
  const packs = cycle
    ? allPacks.filter((p) => p.cycle_id === cycle).map((p) => p.id)
    : pack
      ? [pack]
      : []

  return {
    ...initialFilter,
    // get() returns the decoded value; decoding it again throws on a '%'
    text: query || initialFilter.text,
    packs: packs || initialFilter.packs,
    cycles: cycle ? [cycle] : initialFilter.cycles,
  }
}
