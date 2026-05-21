import { useEffect, useState, type JSX } from 'react'
import asciidoctor from 'asciidoctor'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fab,
  Grid,
  Typography,
  useMediaQuery,
} from '@mui/material'
import TocIcon from '@mui/icons-material/Toc'

export function ELRulesReferenceGuideNew(): JSX.Element {
  const [content, setContent] = useState('Loading')
  const [toc, setToc] = useState('Loading')
  const [showTable, setShowTable] = useState(false)
  const isSmOrBigger = useMediaQuery('(min-width:600px)')
  const asciiDocUrl =
    'https://raw.githubusercontent.com/Emerald-Legacy/rules-documents/main/docs/Rules%20Reference%20Guide.adoc'

  const reformatContent = (asciiDoc: string) => {
    // @ts-ignore
    const asciiDoctor = asciidoctor()
    const convertedHtml = asciiDoctor
      .convert(asciiDoc)
      .toString()
      .replaceAll('[Air]', '<span class=\"icon icon-element-air\"></span>')
      .replaceAll('[Earth]', '<span class=\"icon icon-element-earth\"></span>')
      .replaceAll('[Fire]', '<span class=\"icon icon-element-fire\"></span>')
      .replaceAll('[Void]', '<span class=\"icon icon-element-void\"></span>')
      .replaceAll('[Water]', '<span class=\"icon icon-element-water\"></span>')
      .replaceAll('class="emeralddbsm">&#59648;', 'class=\"icon icon-conflict-military\">')
      .replaceAll('class="emeralddbsm">&#59649;', 'class=\"icon icon-conflict-political\">')
      .replaceAll('class="emeralddb">&#59655;', 'class=\"icon icon-clan-crab\"')
      .replaceAll('class="emeralddb">&#59656;', 'class=\"icon icon-clan-crane\"')
      .replaceAll('class="emeralddb">&#59657;', 'class=\"icon icon-clan-dragon\"')
      .replaceAll('class="emeralddb">&#59658;', 'class=\"icon icon-clan-lion\"')
      .replaceAll('class="emeralddb">&#59659;', 'class=\"icon icon-clan-phoenix\"')
      .replaceAll('class="emeralddb">&#59660;', 'class=\"icon icon-clan-scorpion\"')
      .replaceAll('class="emeralddb">&#59661;', 'class=\"icon icon-clan-unicorn\"')

    const splitted = convertedHtml.split('<div id="preamble">')
    const tableOfContents = splitted[0]
    const document = splitted[1]
    setToc(tableOfContents)
    setContent(document)
  }

  useEffect(() => {
    const myRequest = new Request(asciiDocUrl)
    fetch(myRequest)
      .then((resp) => resp.text())
      .then((text) => reformatContent(text))
  }, [])

  const TableOfContents = () => <div dangerouslySetInnerHTML={{ __html: toc }} />

  return (
    <Grid container spacing={3} direction={isSmOrBigger ? 'row' : 'column-reverse'}>
      <Grid size={{ sm: 8 }}>
        <Box style={{ maxHeight: isSmOrBigger ? '93vh' : '85vh', overflow: 'auto' }} p={1}>
          <Typography variant="h4">Emerald Legacy: Rules Reference</Typography>
          <p>
            PDF Version available{' '}
            <a href={'https://emeraldlegacy.org/rules/'} target={'_blank'}>
              here
            </a>
            .
          </p>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Box>
      </Grid>
      <Grid size={{ sm: 4 }}>
        <Box p={1}>
          {!isSmOrBigger ? (
            <>
              <Fab
                variant="extended"
                color={'secondary'}
                onClick={() => setShowTable(true)}
                style={{ position: 'absolute' }}
              >
                <TocIcon style={{ marginRight: '10px' }} />
                Table of Contents
              </Fab>
              <Dialog open={showTable} keepMounted onClose={() => setShowTable(false)}>
                <DialogContent>
                  <TableOfContents />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowTable(false)} color="secondary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Box style={{ maxHeight: '93vh', overflow: 'auto' }}>
              <TableOfContents />
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
