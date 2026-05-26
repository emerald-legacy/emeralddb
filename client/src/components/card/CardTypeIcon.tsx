import { getColorForFactionId } from '../../utils/factionUtils'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PersonIcon from '@mui/icons-material/Person'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HouseIcon from '@mui/icons-material/House'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import MapIcon from '@mui/icons-material/Map'
import FlareIcon from '@mui/icons-material/Flare'
import GavelIcon from '@mui/icons-material/Gavel'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import FlagIcon from '@mui/icons-material/Flag'

import type { JSX } from 'react'

const icons = [
  { type: 'attachment', icon: AttachFileIcon },
  { type: 'character', icon: PersonIcon },
  { type: 'event', icon: FlashOnIcon },
  { type: 'holding', icon: HouseIcon },
  { type: 'stronghold', icon: AccountBalanceIcon },
  { type: 'province', icon: MapIcon },
  { type: 'role', icon: FlareIcon },
  { type: 'treaty', icon: GavelIcon },
  { type: 'warlord', icon: FlagIcon },
]

export function CardTypeIcon(props: {
  type: string
  faction?: string
  defaultColor?: string
}): JSX.Element {
  const color = props.defaultColor || getColorForFactionId(props.faction || '')
  const style = color
    ? { color: color, fontSize: 16, verticalAlign: 'middle' }
    : { fontSize: 16, verticalAlign: 'middle' }
  const Icon = icons.find((icon) => icon.type === props.type)?.icon || HelpOutlineIcon

  return <Icon style={style} />
}
