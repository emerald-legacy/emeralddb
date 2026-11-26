import { User } from '@5rdb/api'
import { useAuth0 } from '@auth0/auth0-react'
import { createContext, ReactNode, useContext, useEffect, type JSX } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { errorMessage, privateApi } from '../api'
import { Queries } from '../components/HeaderBar'
import { setAccessTokenGetter } from '../utils/accessToken'
import { removeLegacyToken } from '../utils/auth'

export const UserContext = createContext<{
  currentUser: User | undefined
  setCurrentUser: (currentUser: User | undefined) => void
  /** Why the logged-in user couldn't be loaded, if it failed */
  userError: string | undefined
  retryUser: () => void
  isDataAdmin: () => boolean
  isRulesAdmin: () => boolean
  isLoggedIn: () => boolean
}>({
  currentUser: undefined,
  setCurrentUser: () => {
    console.log('UserContext not initialized.')
  },
  userError: undefined,
  retryUser: () => {
    console.log('UserContext not initialized.')
  },
  isDataAdmin: () => false,
  isRulesAdmin: () => false,
  isLoggedIn: () => false,
})

export function UserProvider(props: { children: ReactNode }): JSX.Element {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const queryClient = useQueryClient()

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently())
    removeLegacyToken()
  }, [getAccessTokenSilently])

  // Auth0 knows whether the user is logged in. It also logs the user out when renewing
  // the token fails because the login has expired; the user is then loaded again.
  const queryKey = [Queries.USER, isAuthenticated]
  const userQuery = useQuery({
    queryKey,
    enabled: !isLoading,
    queryFn: async () => (isAuthenticated ? (await privateApi.User.current()).data() : null),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const currentUser = userQuery.data ?? undefined
  const setCurrentUser = (user: User | undefined) => {
    queryClient.setQueryData(queryKey, user ?? null)
  }
  const userError = userQuery.isError ? errorMessage(userQuery.error) : undefined
  const retryUser = () => {
    void userQuery.refetch()
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userError,
        retryUser,
        isDataAdmin: () => currentUser?.roles.includes('data_admin') ?? false,
        isRulesAdmin: () => currentUser?.roles.includes('rules_admin') ?? false,
        isLoggedIn: () => currentUser !== undefined,
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(UserContext)
}
