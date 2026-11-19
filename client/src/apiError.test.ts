import test from 'ava'
import { ApiError, errorMessage } from './apiError'

test('errorMessage returns a plain text message from the server', (t) => {
  t.is(
    errorMessage(new ApiError(400, 'Deck has validation errors', 'x')),
    'Deck has validation errors'
  )
})

test('errorMessage joins a list of validation errors', (t) => {
  t.is(
    errorMessage(new ApiError(400, ['Unknown faction x', 'Unknown trait y'], 'x')),
    'Unknown faction x, Unknown trait y'
  )
})

test('errorMessage reads { message } from the validation middleware', (t) => {
  t.is(
    errorMessage(new ApiError(400, { message: ['"name" is required'] }, 'x')),
    '"name" is required'
  )
  t.is(errorMessage(new ApiError(400, { message: 'Bad request' }, 'x')), 'Bad request')
})

test('errorMessage falls back to the error message for an empty or unknown body', (t) => {
  t.is(
    errorMessage(new ApiError(500, '', 'Request failed with status code 500')),
    'Request failed with status code 500'
  )
  t.is(errorMessage(new ApiError(0, undefined, 'Failed to fetch')), 'Failed to fetch')
  t.is(errorMessage(new ApiError(500, { other: 1 }, 'Request failed')), 'Request failed')
})

test('errorMessage handles other errors and non-errors', (t) => {
  t.is(errorMessage(new Error('boom')), 'boom')
  t.is(errorMessage('boom'), 'unknown error')
})
