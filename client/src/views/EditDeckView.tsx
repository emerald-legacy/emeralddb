import { useNavigate, useParams } from 'react-router'
import { DeckEditor } from '../components/builder/DeckEditor'
import { latestDecklistForDeck } from '../components/deck/DecklistTabs'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { RequestError } from '../components/RequestError'
import { useDeck } from '../hooks/useDeck'
import { useCurrentUser } from '../providers/UserProvider'

import type { JSX } from 'react'

export function EditDeckView(): JSX.Element {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data] = useDeck(params.id!)
  const { currentUser } = useCurrentUser()

  if (data.loading) {
    return <Loading />
  }
  if (data.error) {
    return <RequestError requestError={data.error} />
  }
  if (data.data == null) {
    return <EmptyState />
  }

  const deck = data.data
  if (!currentUser || deck?.user_id !== currentUser?.id) {
    navigate(`/decks/${params.id!}`)
  }

  const latestDecklist = latestDecklistForDeck(deck)

  return <DeckEditor existingDecklist={latestDecklist} />
}
