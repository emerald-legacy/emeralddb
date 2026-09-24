import { useCallback, useEffect, useReducer } from 'react'

interface State<D> {
  loading: boolean
  error?: string
  data?: D
}

type Action<D> =
  { type: 'startRequest' } | { type: 'success'; payload: D } | { type: 'error'; error: string }

// Generic response interface for API calls
interface ApiResponse<T = any> {
  data: () => T
  status: () => number
  error: () => string
}

type ApiCall = (params?: any) => Promise<ApiResponse>
type HookResult<Data> = [State<Data>, () => void]

export function createApiHook<Data>(apiCall: ApiCall): () => HookResult<Data>
export function createApiHook<Data, Id>(
  apiCall: ApiCall,
  pm: (resourceId: Id) => any | undefined
): (resourceId: Id) => HookResult<Data>
export function createApiHook<Data, Id>(
  apiCall: ApiCall,
  pm?: (resourceId: Id) => any | undefined
) {
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

  return function (resourceId: Id): [State<Data>, () => void] {
    const [state, dispatch] = useReducer(reducer, initialState)

    const fetchData = useCallback(() => {
      dispatch({ type: 'startRequest' })
      apiCall(pm ? pm(resourceId) : undefined)
        .then((response) => dispatch({ type: 'success', payload: response.data() }))
        .catch((response) => {
          console.log(response)
          dispatch({ type: 'error', error: response.error() })
        })
    }, [resourceId])

    useEffect(() => fetchData(), [fetchData])

    return [state, fetchData]
  }
}
