import { useCallback, useEffect, useReducer } from 'react'
import { errorMessage, type ApiResponse } from '../api'

interface State<Data> {
  loading: boolean
  error?: string
  data?: Data
}

type Action<Data> =
  { type: 'startRequest' } | { type: 'success'; payload: Data } | { type: 'error'; error: string }

type HookResult<Data> = [State<Data>, () => void]

/**
 * Creates a hook that loads data on mount and whenever the resource id changes.
 * `load` maps the id to an API call, e.g. `(cardId: string) => publicApi.Card.find({ cardId })`;
 * hooks without an id pass the API function directly.
 */
export function createApiHook<Data, Id = void>(
  load: (resourceId: Id) => Promise<ApiResponse<Data>>
): (resourceId: Id) => HookResult<Data> {
  const initialState: State<Data> = { loading: true }

  function reducer(state: State<Data>, action: Action<Data>): State<Data> {
    switch (action.type) {
      case 'startRequest':
        return { ...state, loading: true, error: undefined }
      case 'success':
        return {
          loading: false,
          data: action.payload,
        }
      case 'error':
        return { loading: false, error: action.error }
    }
  }

  return function (resourceId: Id): HookResult<Data> {
    const [state, dispatch] = useReducer(reducer, initialState)

    const fetchData = useCallback(() => {
      dispatch({ type: 'startRequest' })
      load(resourceId)
        .then((response) => dispatch({ type: 'success', payload: response.data() }))
        .catch((error: unknown) => {
          console.log(error)
          dispatch({ type: 'error', error: errorMessage(error) })
        })
    }, [resourceId])

    useEffect(() => fetchData(), [fetchData])

    return [state, fetchData]
  }
}
