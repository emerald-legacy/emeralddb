import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Theme } from '@mui/material/styles'

import type { JSX } from 'react'

const PREFIX = 'HelpView'

const classes = {
  root: `${PREFIX}-root`,
  heading: `${PREFIX}-heading`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.root}`]: {
    width: '100%',
  },

  [`& .${classes.heading}`]: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: (theme.typography.fontWeightRegular as number) || 400,
  },
}))

export function HelpView(): JSX.Element {
  return (
    <Root>
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Frequently Asked Questions
        </Typography>
        <Card>
          <CardContent sx={{ '&:last-child': { paddingBottom: 1 } }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="registering-problems">
                <Typography className={classes.heading}>
                  <b>When I try to sign up, I get an error message. Why?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      This usually happens when there already is an account for the e-mail address
                      you try to sign up with. Please try the "Forgot password?" link in the log in
                      mask to reset your password. If the problem persists, please send an e-mail to
                      emeralddb[at]emeraldlegacy[dot]org or send a Discord DM to workerbee.
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="jigoku-export">
                <Typography className={classes.heading}>
                  <b>How do I export my deck to Jigoku?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      To export your deck to Jigoku, save it and select it in the "Builder" section.
                      Use one of the two highlighted buttons to get a permalink to your deck list.
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <img style={{ width: '75%' }} src="./static/images/ExportLinks.png" />
                  </Grid>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      Once you are on Jigoku, create a new deck and use the "Import Deck". Paste
                      your permalink in the text field and click on "Import". This should fill the
                      name, format, the card list, as well as primary and splash clans. Don't forget
                      to save your deck!
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <img style={{ width: '75%' }} src="./static/images/ImportJigoku.png" />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="jigoku-import">
                <Typography className={classes.heading}>
                  <b>How do I import my deck from Jigoku?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      To import an existing deck from Jigoku, click on the "Create Deck" button in
                      the Builder section. Click on the "Import from Jigoku" Button. In the pop up
                      that opens, select the format of the deck you want to import and paste the
                      contents of the "Jigoku Export" from Jigoku in the text field. You can also
                      import a deck from the{' '}
                      <a href={'https://www.kensei-l5r-toolkit.com/'}>
                        Kensei Legend of the Five Rings Toolkit
                      </a>
                      , it provides the same format as Jigoku.
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <img style={{ width: '30%' }} src="./static/images/Import5RDBAndBB.png" />
                  </Grid>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      Complete the import by clicking on the "Import Deck" button and don't forget
                      to save your deck in the deckbuilder view afterwards.
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="formats">
                <Typography className={classes.heading}>
                  <b>Which formats does EmeraldDB and Jigoku support?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      EmeraldDB supports deckbuilding for the following formats:
                      <ul>
                        <li>Emerald Legacy format</li>
                        <li>Sanctuary format</li>
                        <li>Obsidian format</li>
                        <li>Fantasy Flight Games' Stronghold format</li>
                        <li>Fantasy Flight Games' Skirmish format</li>
                        <li>Fantasy Flight Games' Enlightenment format</li>
                      </ul>
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography component={'div'}>
                      Of these formats, Jigoku supports:
                      <ul>
                        <li>Emerald Legacy format</li>
                        <li>Sanctuary format</li>
                        <li>Obsidian format</li>
                        <li>Fantasy Flight Games' Stronghold format</li>
                        <li>Fantasy Flight Games' Skirmish format</li>
                      </ul>
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="feedback">
                <Typography className={classes.heading}>
                  <b>I have feedback/I have found a bug, where do I post it?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component={'div'}>
                  We're glad to hear back from you. If you have any feedback or criticism, please
                  create an issue on{' '}
                  <a href={'https://github.com/Emerald-Legacy/emeralddb/issues/new'}>GitHub</a> or
                  send a Discord DM to workerbee or hidaamoro
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="collaborate">
                <Typography className={classes.heading}>
                  <b>How can I help maintaining and developing EmeraldDB?</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component={'div'}>
                  We're always happy to find people willing to help out in some form or capacity. If
                  you are a web developer and have at least some basic experience with TypeScript,
                  React and Node, send a Discord DM to workerbee or hidaamoro. We'll find a way to
                  get you involved.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Box>
    </Root>
  )
}
