import { Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material'
import { DecklistCommentWithChildren } from './DecklistComments'
import { useState, type JSX } from 'react';
import { privateApi } from '../../api'
import { useSnackbar } from 'notistack'
import ReplyIcon from '@mui/icons-material/Reply'
import { useCurrentUser } from '../../providers/UserProvider'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useConfirm } from 'material-ui-confirm'

export function DecklistComment(props: {
  comment: DecklistCommentWithChildren
  onCommentsChange: () => void
}): JSX.Element {
  const { isLoggedIn, currentUser } = useCurrentUser()
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedComment, setEditedComment] = useState(props.comment.comment)
  const [newComment, setNewComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const confirm = useConfirm()

  function answerComment() {
    setIsSaving(true)
    privateApi.Comment.create({
      body: {
        comment: newComment,
        decklist_id: props.comment.decklist_id,
        parent_comment_id: props.comment.id,
      },
    })
      .then(() => {
        props.onCommentsChange()
        enqueueSnackbar('Successfully created comment!', { variant: 'success' })
        setIsCreateMode(false)
        setNewComment('')
      })
      .catch(() => {
        enqueueSnackbar('Could not create comment!', { variant: 'error' })
      })
      .finally(() => setIsSaving(false))
  }

  function editComment() {
    setIsSaving(true)
    privateApi.Comment.update({
      id: props.comment.id,
      body: {
        comment: editedComment,
      },
    })
      .then(() => {
        props.onCommentsChange()
        enqueueSnackbar('Successfully edited comment!', { variant: 'success' })
        setIsEditMode(false)
      })
      .catch(() => {
        enqueueSnackbar('Could not edit comment!', { variant: 'error' })
      })
      .finally(() => setIsSaving(false))
  }

  async function confirmDeletion() {
    const { confirmed } = await confirm({ title: 'Delete Comment', description: 'Do you really want to delete this comment?', confirmationText: 'Delete' })
    if (!confirmed) return
    privateApi.Comment.delete({ id: props.comment.id })
      .then(() => {
        props.onCommentsChange()
        enqueueSnackbar('Successfully deleted comment!', { variant: 'success' })
      })
      .catch(() => {
        enqueueSnackbar("The comment couldn't be deleted!", { variant: 'error' })
      })
  }

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Box border="1px solid" borderRadius="4px" p={2}>
          {isEditMode ? (
            <>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <TextField
                    multiline
                    value={editedComment}
                    fullWidth
                    variant="outlined"
                    rows="3"
                    autoFocus
                    onChange={(e) => setEditedComment(e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setIsEditMode(false)
                      setEditedComment(props.comment.comment)
                    }}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={editedComment === '' || isSaving}
                    onClick={() => editComment()}
                    fullWidth
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Typography>
                {props.comment.comment.split('\n').map((line, key) => (
                  <p key={key}>{line}</p>
                ))}
              </Typography>
              {currentUser?.id === props.comment.user_id && (
                <Typography align="right" variant="subtitle2">
                  <IconButton color="secondary" size="small" onClick={() => setIsEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => confirmDeletion()}>
                    <DeleteIcon />
                  </IconButton>
                </Typography>
              )}
              <Typography align="right" variant="subtitle2">
                by {props.comment.username} ({new Date(props.comment.created_at).toLocaleString()})
              </Typography>
            </>
          )}
        </Box>
      </Grid>
      <Grid hidden={!isLoggedIn()} size={12}>
        {isCreateMode ? (
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
                  setIsCreateMode(false)
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
                onClick={() => answerComment()}
                fullWidth
                size="small"
              >
                Save
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={1}>
            <Grid size={3} />
            <Grid size={9}>
              <Button
                variant="outlined"
                startIcon={<ReplyIcon />}
                onClick={() => setIsCreateMode(true)}
                fullWidth
                size="small"
              >
                Reply
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
      {props.comment.children.map((comment) => (
        <Grid key={comment.id} size={12}>
          <Box paddingLeft={4}>
            <DecklistComment comment={comment} onCommentsChange={() => props.onCommentsChange()} />
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
