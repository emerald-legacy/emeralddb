// Shared test helpers. Only imported by *.test.ts, so not part of the build.
import type { Card } from '@5rdb/api'
import type { Express } from 'express'

/** A complete Card with neutral defaults, for tests that only care about a few fields */
export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-id',
    name: 'Card Name',
    faction: 'crab',
    side: 'dynasty',
    type: 'character',
    is_unique: false,
    role_restrictions: [],
    deck_limit: 3,
    ...overrides,
  }
}

export interface TestResponse {
  status: number
  /** The parsed JSON body, the raw text if it isn't JSON, or undefined if empty */
  body: unknown
}

function parseBody(text: string): unknown {
  if (text === '') return undefined
  try {
    const json: unknown = JSON.parse(text)
    return json
  } catch {
    return text
  }
}

/** Sends one request to the app on a random port and returns the response */
export async function sendRequest(
  app: Express,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<TestResponse> {
  app.set('env', 'test') // keeps Express's default error handler from logging
  const server = app.listen(0)
  try {
    const address = server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('Expected a TCP server address')
    }
    const response = await fetch(`http://localhost:${address.port}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    return { status: response.status, body: parseBody(text) }
  } finally {
    server.close()
  }
}
