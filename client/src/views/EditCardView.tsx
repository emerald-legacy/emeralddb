import { useParams } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { RequestError } from '../components/RequestError'
import { useCard } from '../hooks/useCard'
import { CardEditor } from '../components/forms/CardEditor'

import type { JSX } from 'react'

export function EditCardView(): JSX.Element {
  const params = useParams<{ id: string }>()
  const [data] = useCard(params.id!)

  if (data.loading) {
    return <Loading />
  }
  if (data.error) {
    return <RequestError requestError={data.error} />
  }
  if (data.data == null) {
    return <EmptyState />
  }

  const card = data.data

  return <CardEditor existingCard={card} editMode />
}
