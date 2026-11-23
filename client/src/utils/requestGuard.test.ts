import test from 'ava'
import { createRequestGuard } from './requestGuard'

test('a response of an older request is not the latest (regression)', (t) => {
  const requests = createRequestGuard()
  const isFirstLatest = requests.start()
  const isSecondLatest = requests.start()
  // The first response arrives last: it must not replace the second one's data
  t.false(isFirstLatest())
  t.true(isSecondLatest())
})

test('after cancelling, no started request is the latest', (t) => {
  const requests = createRequestGuard()
  const isLatest = requests.start()
  requests.cancel()
  t.false(isLatest())
  t.true(requests.start()())
})
