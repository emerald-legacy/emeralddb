import { Format } from '@5rdb/api'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Typography } from '@mui/material'
import { useState, type JSX } from 'react'
import { EmeraldDBLink } from '../EmeraldDBLink'

export function FormatWithInfo(props: { format: Format }): JSX.Element {
  const [infoShown, setInfoShown] = useState(false)
  const toggleInfoShown = () => {
    setInfoShown(!infoShown)
  }

  const hasInfo = props.format.description || props.format.maintainer || props.format.info_link

  return (
    <>
      <span>
        {props.format.name}{' '}
        {hasInfo && (
          <span onClick={(_) => toggleInfoShown()}>
            <InfoOutlinedIcon color={infoShown ? 'error' : 'secondary'} />
          </span>
        )}
      </span>
      <Box hidden={!infoShown} border="1px solid grey" padding={1}>
        {props.format.description && (
          <Typography>
            <b>Description: </b>
            <span
              dangerouslySetInnerHTML={{
                __html: props.format.description.replaceAll('\n', '<br/>'),
              }}
            />
          </Typography>
        )}
        {props.format.maintainer && (
          <Typography>
            <b>Maintainer: </b> {props.format.maintainer}
          </Typography>
        )}
        {props.format.info_link && (
          <Typography>
            <b>More Info: </b>
            <EmeraldDBLink href={props.format.info_link} openInNewTab>
              <b>
                <u>{props.format.info_link}</u>
              </b>
            </EmeraldDBLink>
          </Typography>
        )}
      </Box>
    </>
  )
}
