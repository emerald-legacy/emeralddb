import { User } from '@5rdb/api'
import { createContext, ReactNode, useState, useContext, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { privateApi } from '../api'
import { Queries } from '../components/HeaderBar'
import { getToken } from '../utils/auth'

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

  useQuery({
    queryKey: [Queries.USER],
    queryFn: async () => {
      const token = getToken()
      if (!token) {
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
