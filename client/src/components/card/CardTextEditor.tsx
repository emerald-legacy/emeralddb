import { Grid, TextField, Typography, Box } from '@mui/material'
import { useRef, useState, type JSX } from 'react'
import { CardText } from './CardText'
import { CardTextEditorButtons } from './CardTextEditorButtons'
import { getColorForFactionId } from '../../utils/factionUtils'

export function CardTextEditor(props: {
  onChange: (text: string) => void
  text?: string
  faction?: string
}): JSX.Element {
  const inputRef = useRef<any>(null)
  const [text, setText] = useState(props.text || '')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const color = getColorForFactionId(props.faction || '')

  const setTextAndTriggerEvent = (newText: string) => {
    setText(newText)
    props.onChange(newText)
  }

  const addTagOrIconAroundText = (tagOrIconName: string, isIcon: boolean) => {
    const textCopy = text
    const textBeforeSelection = textCopy.substr(0, selectionStart)
    const rest = textCopy.substr(selectionStart)
    let result = ''
    if (isIcon) {
      result = `${textBeforeSelection}[${tagOrIconName}]${rest}`
    } else if (selectionStart === selectionEnd) {
      result = `${textBeforeSelection}<${tagOrIconName}/>${rest}`
    } else {
      const selectedText = rest.substr(0, selectionEnd - selectionStart)
      const textAfterSelection = rest.substr(selectedText.length)
      result = `${textBeforeSelection}<${tagOrIconName}>${selectedText}</${tagOrIconName}>${textAfterSelection}`
    }
    setTextAndTriggerEvent(result)
  }

  const updateSelectionStart = () => {
    if (inputRef?.current) {
      setSelectionEnd(inputRef.current.selectionEnd)
      setSelectionStart(inputRef.current.selectionStart)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography>HTML-Input:</Typography>
        <CardTextEditorButtons onClick={addTagOrIconAroundText} />
        <TextField
          id="input-text"
          value={text}
          fullWidth
          variant="outlined"
          onChange={(e) => setTextAndTriggerEvent(e.target.value)}
          multiline
          inputRef={inputRef}
          onSelect={updateSelectionStart}
        />
      </Grid>
      <Grid size={12}>
        <Typography>Preview:</Typography>
        <Box borderColor={color} borderLeft={5} paddingLeft="10px">
          <CardText text={text} />
        </Box>
      </Grid>
    </Grid>
  )
}
