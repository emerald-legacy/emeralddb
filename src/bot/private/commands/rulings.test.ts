import '../../../testEnv'
import test from 'ava'
import { toEmbed } from './rulings'
import { CachedCard, RulingInput } from '../types'

const card: CachedCard = {
  id: 'battlefield-orders',
  name: 'Battlefield Orders',
  image: 'https://example.org/battlefield-orders.webp',
}

function ruling(overrides: Partial<RulingInput> = {}): RulingInput {
  return {
    id: 1093,
    text: 'Some ruling text',
    source: 'Developer ruling',
    link: 'https://example.org/ruling',
    ...overrides,
  }
}

// Building the JSON runs the same checks as sending the embed to Discord
const embedOf = (input: RulingInput) => toEmbed(card)(input).toJSON()

test('a ruling with link and source has both in its embed', (t) => {
  const embed = embedOf(ruling())
  t.is(embed.url, 'https://example.org/ruling')
  t.is(embed.footer?.text, 'Developer ruling')
})

test('a ruling without a link has no URL in its embed (regression)', (t) => {
  // An empty link made the embed throw, which crashed the whole server
  for (const link of ['', null, undefined]) {
    t.is(embedOf(ruling({ link })).url, undefined, String(link))
  }
})

test('a link that is not a web address is left out (regression)', (t) => {
  for (const link of ['RRG "Triggered Abilities"', 'ftp://example.org/ruling']) {
    t.is(embedOf(ruling({ link })).url, undefined, link)
  }
})

test('a ruling without a source has no footer (regression)', (t) => {
  for (const source of ['', null, undefined]) {
    t.is(embedOf(ruling({ source })).footer, undefined, String(source))
  }
})
