import { useDecklistComments } from '../../hooks/useDecklistComments'
import { Loading } from '../Loading'
import { RequestError } from '../RequestError'
import { EmptyState } from '../EmptyState'
import { Button, Grid, TextField, Typography } from '@mui/material'
import { DecklistCommentWithUser } from '@5rdb/api'
import { DecklistComment } from './DecklistComment'
import { useState, type JSX } from 'react'
import { useSnackbar } from 'notistack'
import ReplyIcon from '@mui/icons-material/Reply'
import { privateApi } from '../../api'
import { useCurrentUser } from '../../providers/UserProvider'

export type DecklistCommentWithChildren = DecklistCommentWithUser & {
  children: DecklistCommentWithChildren[]
}

export function DecklistComments(props: { decklistId: string }): JSX.Element {
  const { isLoggedIn } = useCurrentUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [data, fetchData] = useDecklistComments(props.decklistId)
  if (data.loading) {
    return <Loading />
  }
  if (data.error) {
    return <RequestError requestError={data.error} />
  }
  if (data.data == null) {
    return <EmptyState />
  }

  function createCommentTree(comments: DecklistCommentWithUser[]): DecklistCommentWithChildren[] {
    const allComments = comments.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const parentComments: DecklistCommentWithChildren[] = allComments
      .filter((comment) => !comment.parent_comment_id)
      .map((comment) => ({ ...comment, children: [] }))
    const childComments: DecklistCommentWithChildren[] = allComments
      .filter((comment) => comment.parent_comment_id)
      .map((comment) => ({ ...comment, children: [] }))

    let levelParents = parentComments
    let levelChildren = childComments.filter((child) =>
      levelParents.some((parent) => parent.id === child.parent_comment_id)
    )
    while (levelChildren.length > 0) {
      levelChildren.forEach((child) =>
        levelParents.find((parent) => parent.id === child.parent_comment_id)?.children?.push(child)
      )
      levelParents = levelChildren
      levelChildren = childComments.filter((child) =>
        levelParents.some((parent) => parent.id === child.parent_comment_id)
      )
    }

    console.log(parentComments)
    return parentComments
  }

  const comments = data.data
  const commentsWithChildren = createCommentTree(comments)

  function createComment() {
    setIsSaving(true)
    privateApi.Comment.create({
      body: {
        comment: newComment,
        decklist_id: props.decklistId,
      },
    })
      .then(() => {
        fetchData()
        enqueueSnackbar('Successfully created comment!', { variant: 'success' })
        setIsEditMode(false)
        setNewComment('')
      })
      .catch(() => {
        enqueueSnackbar('Could not create comment!', { variant: 'error' })
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Typography>
          <b>Comments:</b>
        </Typography>
      </Grid>
      <Grid hidden={!isLoggedIn()} size={12}>
        {isEditMode ? (
          <Grid container spacing={1}>
            <Grid size={12}>
              <TextField
                multiline
                value={newComment}
                fullWidth
                variant="outlined"
                rows="3"
                autoFocus
                onChange={(e) => setNewComment(e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <Button
                variant="contained"
                onClick={() => {
                  setIsEditMode(false)
                  setNewComment('')
                }}
                fullWidth
                size="small"
              >
                Cancel
              </Button>
            </Grid>
            <Grid size={6}>
              <Button
                variant="contained"
                color="secondary"
                disabled={newComment === '' || isSaving}
                onClick={() => createComment()}
                fullWidth
                size="small"
              >
                Save
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ReplyIcon />}
            onClick={() => setIsEditMode(true)}
            fullWidth
            size="small"
          >
            Create New Comment
          </Button>
        )}
      </Grid>
      {commentsWithChildren.map((comment) => (
        <Grid key={comment.id} size={12}>
          <DecklistComment comment={comment} onCommentsChange={() => fetchData()} />
        </Grid>
      ))}
    </Grid>
  )
}
