import '../testEnv'
import test from 'ava'
import { withUsername, withUsernames } from './withUsernames'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import userStore = require('../gateways/storage/private/user')

test.serial('adds each owner’s name with a single lookup', async (t) => {
  const lookups: string[][] = []
  userStore.getUserNames = async (publicIds) => {
    lookups.push(publicIds)
    return new Map([
      ['public-a', 'Alice'],
      ['public-b', 'Bob'],
    ])
  }

  const result = await withUsernames(
    [
      { id: 1, owner_id: 'public-a' },
      { id: 2, owner_id: 'public-b' },
      { id: 3, owner_id: 'public-a' },
    ],
    'owner_id'
  )

  t.deepEqual(result, [
    { id: 1, owner_id: 'public-a', username: 'Alice' },
    { id: 2, owner_id: 'public-b', username: 'Bob' },
    { id: 3, owner_id: 'public-a', username: 'Alice' },
  ])
  t.is(lookups.length, 1)
})

test.serial('users without a name are shown as unknown', async (t) => {
  // users.name is nullable
  userStore.getUserNames = async () => new Map([['public-x', null]])

  const result = await withUsernames([{ author_id: 'public-x' }], 'author_id')

  t.deepEqual(result, [{ author_id: 'public-x', username: 'Unknown user' }])
})

test.serial('users that are not found are shown as unknown', async (t) => {
  userStore.getUserNames = async () => new Map()

  const result = await withUsernames([{ author_id: 'public-x' }], 'author_id')

  t.deepEqual(result, [{ author_id: 'public-x', username: 'Unknown user' }])
})

test.serial('an empty list needs no lookup', async (t) => {
  let lookups = 0
  userStore.getUserNames = async () => {
    lookups += 1
    return new Map()
  }

  t.deepEqual(await withUsernames([], 'owner_id'), [])
  t.is(lookups, 0)
})

test.serial('withUsername adds the name to a single item', async (t) => {
  userStore.getUserNames = async () => new Map([['public-a', 'Alice']])

  t.deepEqual(await withUsername({ id: 1, owner_id: 'public-a' }, 'owner_id'), {
    id: 1,
    owner_id: 'public-a',
    username: 'Alice',
  })
})

test('the field must exist and hold a string (compile-time check)', (t) => {
  // Not called: the type checker is the test
  const _checks = () => [
    // @ts-expect-error: the items have no owner_id
    withUsernames([{ id: 1 }], 'owner_id'),
    // @ts-expect-error: id is not a string
    withUsername({ id: 1, owner_id: 'public-a' }, 'id'),
  ]
  t.pass()
})
