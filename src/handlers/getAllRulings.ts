import { getAllRulings } from '../gateways/storage/index'
import { Ruling } from '@5rdb/api'

export async function handler(): Promise<Ruling[]> {
  return getAllRulings()
}
