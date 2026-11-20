import { getAllPublishedDecklists } from '../gateways/storage/index'
import { PublishedDecklistWithExtraInfo } from '@5rdb/api'
import { addExtraInfoToDecklist } from './getDecklist'
import { withUsernames } from '../utils/withUsernames'

export async function handler(): Promise<PublishedDecklistWithExtraInfo[] | undefined> {
  const decklists = await withUsernames(await getAllPublishedDecklists(), 'owner_id')

  return Promise.all(
    decklists.map(async (decklist) => {
      const withExtraInfo = await addExtraInfoToDecklist(decklist)
      return {
        ...decklist,
        stronghold: withExtraInfo.stronghold,
        role: withExtraInfo.role,
      }
    })
  )
}
