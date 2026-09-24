import { CardWithVersions } from '@5rdb/api'
import { Box, Chip } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CachedIcon from '@mui/icons-material/Cached'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import WarningIcon from '@mui/icons-material/Warning'
import { useUiStore } from '../../providers/UiStoreProvider'
import { getFormatLegalities, Legality } from '../../utils/legalityUtils'
import { EmeraldDBLink } from '../EmeraldDBLink'

import type { JSX } from 'react'

const legalityStyles: Record<Legality, { label: string; color: string; icon: JSX.Element }> = {
  legal: { label: 'Legal', color: '#2e7d32', icon: <CheckCircleIcon /> },
  restricted: { label: 'Restricted', color: '#b54a00', icon: <WarningIcon /> },
  banned: { label: 'Banned', color: '#c62828', icon: <BlockIcon /> },
  rotated: { label: 'Rotated', color: '#616161', icon: <CachedIcon /> },
  'not-legal': { label: 'Not legal', color: '#757575', icon: <RemoveCircleOutlineIcon /> },
}

function LegalityChip(props: { legality: Legality }): JSX.Element {
  const style = legalityStyles[props.legality]
  const isOutlined = props.legality === 'not-legal'
  return (
    <Chip
      size="small"
      icon={style.icon}
      label={style.label}
      variant={isOutlined ? 'outlined' : 'filled'}
      sx={{
        width: 104,
        height: 22,
        justifyContent: 'flex-start',
        borderRadius: '3px',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: isOutlined ? style.color : '#fff',
        backgroundColor: isOutlined ? 'transparent' : style.color,
        borderColor: '#bdbdbd',
        '& .MuiChip-icon': {
          color: 'inherit',
          fontSize: 14,
          marginLeft: '6px',
          marginRight: '-2px',
        },
      }}
    />
  )
}

export function CardLegality(props: { card: CardWithVersions; maxWidth: number }): JSX.Element {
  const { relevantFormats } = useUiStore()

  return (
    <Box
      component="section"
      aria-label="Legality"
      border="1px solid"
      borderColor="lightgrey"
      borderRadius="3px"
      padding={1.5}
      marginTop={2}
      width="100%"
      maxWidth={props.maxWidth}
      boxSizing="border-box"
    >
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: '104px 1fr',
          columnGap: '10px',
          rowGap: '6px',
          alignItems: 'center',
        }}
      >
        {getFormatLegalities(props.card, relevantFormats).map(({ format, legality }) => {
          const isPlayable = legality !== 'not-legal' && legality !== 'rotated'
          return (
            <Box component="li" key={format.id} sx={{ display: 'contents' }}>
              <LegalityChip legality={legality} />
              <Box
                component="span"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  color: isPlayable ? 'inherit' : 'text.secondary',
                }}
              >
                <EmeraldDBLink href={`/rules/organized-play/${format.id}`}>
                  {format.name}
                </EmeraldDBLink>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
