import { User } from '@5rdb/api'
import { useAuth0 } from '@auth0/auth0-react'
import { createContext, ReactNode, useState, useContext, useEffect, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { privateApi } from '../api'
import { Queries } from '../components/HeaderBar'
import { setAccessTokenGetter } from '../utils/accessToken'
import { removeLegacyToken } from '../utils/auth'

export const UserContext = createContext<{
  currentUser: User | undefined
  setCurrentUser: (currentUser: User | undefined) => void
  isDataAdmin: () => boolean
  isRulesAdmin: () => boolean
  isLoggedIn: () => boolean
}>({
  currentUser: undefined,
  setCurrentUser: () => {
    console.log('UserContext not initialized.')
  },
  isDataAdmin: () => false,
  isRulesAdmin: () => false,
  isLoggedIn: () => false,
})

export function UserProvider(props: { children: ReactNode }): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined)
  const isDataAdmin = () => {
    return currentUser?.roles.includes('data_admin') || false
  }
  const isRulesAdmin = () => {
    return currentUser?.roles.includes('rules_admin') || false
  }
  const isLoggedIn = () => {
    return currentUser !== undefined
  }

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently())
    removeLegacyToken()
  }, [getAccessTokenSilently])

  // Auth0 knows whether the user is logged in. It also logs the user out when renewing
  // the token fails because the login has expired; the user is then loaded again.
  useQuery({
    queryKey: [Queries.USER, isAuthenticated],
    enabled: !isLoading,
    queryFn: async () => {
      if (!isAuthenticated) {
        setCurrentUser(undefined)
        return null
      }
      try {
        const user = await privateApi.User.current()
        setCurrentUser(user.data())
        return user.data()
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        setCurrentUser(undefined)
        return null
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  return (
    <UserContext.Provider
      value={{
        currentUser: currentUser,
        setCurrentUser: setCurrentUser,
        isDataAdmin: isDataAdmin,
        isRulesAdmin: isRulesAdmin,
        isLoggedIn: isLoggedIn,
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(UserContext)
}
