import { Ruling } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import {
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import { useState, type JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import { privateApi } from '../api'
import { useCurrentUser } from '../providers/UserProvider'

const PREFIX = 'RulingList'

const classes = {
  editButton: `${PREFIX}-editButton`,
  createButton: `${PREFIX}-createButton`,
  deleteButton: `${PREFIX}-deleteButton`,
  input: `${PREFIX}-input`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.editButton}`]: {
    backgroundColor: theme.palette.warning.light,
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },

  [`& .${classes.createButton}`]: {
    marginTop: theme.spacing(2),
  },

  [`& .${classes.deleteButton}`]: {
    backgroundColor: theme.palette.error.light,
  },

  [`& .${classes.input}`]: {
    marginBottom: theme.spacing(2),
  },
}))

export function RulingList(props: { cardId: string; rulings: Ruling[] }): JSX.Element {
  const { isRulesAdmin } = useCurrentUser()
  const confirm = useConfirm()
  const [rulingModalOpen, setRulingModalOpen] = useState(false)
  const [rulingId, setRulingId] = useState(-1)
  const [rulingText, setRulingText] = useState('')
  const [rulingSource, setRulingSource] = useState('')
  const [rulingLink, setRulingLink] = useState('')
  const currentHost = window.location.host
  const currentProtocol = window.location.protocol
  const host = currentProtocol + '//' + currentHost
  const { enqueueSnackbar } = useSnackbar()

  function editRuling(ruling: Ruling) {
    setRulingId(ruling.id)
    setRulingText(ruling.text)
    setRulingSource(ruling.source)
    setRulingLink(ruling.link)
    setRulingModalOpen(true)
  }

  function createRuling() {
    setRulingId(-1)
    setRulingText('')
    setRulingSource('')
    setRulingLink('')
    setRulingModalOpen(true)
  }

  async function confirmDeletion(ruling: Ruling) {
    const { confirmed } = await confirm({
      title: 'Delete Ruling',
      description: 'Do you really want to delete this ruling?',
      confirmationText: 'Delete',
    })
    if (!confirmed) return
    privateApi.Ruling.delete({ rulingId: ruling.id })
      .then(() => {
        window.location.reload()
      })
      .catch((error) => {
        console.log(error)
        enqueueSnackbar("The ruling couldn't be deleted!", { variant: 'error' })
      })
  }

  async function createOrUpdateRuling() {
    if (rulingId === -1) {
      const { confirmed } = await confirm({
        title: 'Create Ruling',
        description: 'Do you really want to create this ruling?',
        confirmationText: 'Create',
      })
      if (!confirmed) return
      privateApi.Ruling.create({
        body: {
          card_id: props.cardId,
          text: rulingText,
          source: rulingSource,
          link: rulingLink,
        },
      })
        .then(() => {
          window.location.reload()
        })
        .catch((error) => {
          console.log(error)
          enqueueSnackbar("The ruling couldn't be created!", { variant: 'error' })
        })
    } else {
      const { confirmed } = await confirm({
        title: 'Update Ruling',
        description: 'Do you really want to update this ruling?',
        confirmationText: 'Update',
      })
      if (!confirmed) return
      privateApi.Ruling.update({
        rulingId: rulingId,
        body: {
          id: rulingId,
          card_id: props.cardId,
          text: rulingText,
          source: rulingSource,
          link: rulingLink,
        },
      })
        .then(() => {
          window.location.reload()
        })
        .catch((error) => {
          console.log(error)
          enqueueSnackbar("The ruling couldn't be created!", { variant: 'error' })
        })
    }
  }

  function replaceLinkTo5rdb(link: string): string {
    let newText = link
    if (link?.includes('https://fiveringsdb.com')) {
      newText = newText.replaceAll('https://fiveringsdb.com', host)
    }
    if (newText?.includes('/rules/reference')) {
      newText = newText.replaceAll('/rules/reference', '/rules/emerald')
    }
    return newText || ''
  }

  return (
    <StyledGrid container spacing={1}>
      {props.rulings.map((ruling) => (
        <Grid key={ruling.id} size={12}>
          <Box
            border="1px solid"
            borderColor="lightgrey"
            marginTop={1}
            padding={2}
            borderRadius="3px"
          >
            <ReactMarkdown>
              {`${replaceLinkTo5rdb(ruling.text)} 

 ~ [${ruling.source}](${replaceLinkTo5rdb(ruling.link)})`}
            </ReactMarkdown>
          </Box>
          {isRulesAdmin() && (
            <Box bgcolor="#eeeeee" padding={1} display="flex">
              <Button
                variant="contained"
                className={classes.editButton}
                onClick={() => editRuling(ruling)}
              >
                Edit Ruling
              </Button>
              <Button
                variant="contained"
                className={classes.deleteButton}
                onClick={() => confirmDeletion(ruling)}
              >
                Delete Ruling
              </Button>
            </Box>
          )}
        </Grid>
      ))}
      {isRulesAdmin() && (
        <Button
          variant="contained"
          fullWidth
          className={classes.createButton}
          color="secondary"
          onClick={() => createRuling()}
        >
          Create New Ruling
        </Button>
      )}
      <Dialog open={rulingModalOpen} onClose={() => setRulingModalOpen(false)}>
        <DialogTitle sx={{ paddingBottom: 2 }}>
          {rulingId === -1 ? 'Create New Ruling' : 'Edit Ruling'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={12}>
              <TextField
                value={rulingText}
                multiline
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setRulingText(e.target.value)}
                label="Text"
              />
            </Grid>
            <Grid size={12}>
              <Box padding={2} border="1px solid lightgray">
                <Typography>Preview:</Typography>
                <ReactMarkdown>{rulingText}</ReactMarkdown>
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField
                value={rulingSource}
                multiline
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setRulingSource(e.target.value)}
                label="Source"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                value={rulingLink}
                multiline
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => setRulingLink(e.target.value)}
                label="Link"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container spacing={1} justifyContent="flex-end">
            <Grid>
              <Button
                onClick={() => setRulingModalOpen(false)}
                color="secondary"
                variant="contained"
              >
                Close
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" color="secondary" onClick={() => createOrUpdateRuling()}>
                {rulingId === -1 ? 'Create New Ruling' : 'Edit Ruling'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </StyledGrid>
  )
}
