import { Card, CardInPack, CardWithVersions } from '@5rdb/api'
import { styled } from '@mui/material/styles'
import { Box, Typography, Grid } from '@mui/material'
import { useUiStore } from '../../providers/UiStoreProvider'
import { convertTraitList } from '../../utils/cardTextUtils'
import { getColorForFactionId } from '../../utils/factionUtils'
import { capitalize } from '../../utils/stringUtils'
import { CardText } from './CardText'
import { ElementSymbol } from './ElementSymbol'
import { useNavigate } from 'react-router'

import type { JSX } from 'react'

const PREFIX = 'CardInformation'

const classes = {
  clanMon: `${PREFIX}-clanMon`,
  deckLabel: `${PREFIX}-deckLabel`,
  stats: `${PREFIX}-stats`,
  packInfo: `${PREFIX}-packInfo`,
  crossedOutStats: `${PREFIX}-crossedOutStats`,
  block: `${PREFIX}-block`,
}

const StyledBox = styled(Box)(() => ({
  [`& .${classes.clanMon}`]: {
    width: 60,
    height: 60,
    float: 'right',
  },

  [`& .${classes.deckLabel}`]: {
    float: 'right',
    fontSize: 14,
  },

  [`& .${classes.stats}`]: {
    fontSize: 14,
  },

  [`& .${classes.packInfo}`]: {
    fontSize: 12,
  },

  [`& .${classes.crossedOutStats}`]: {
    fontSize: 14,
    textDecoration: 'line-through',
  },

  [`& .${classes.block}`]: {
    marginBottom: 10,
  },
}))

export function FormattedValueOrCrossedOut(props: {
  value: string | undefined
  label: string
  icon?: string
}): JSX.Element {
  if (props.value === undefined || props.value === null) {
    return (
      <Typography className={classes.crossedOutStats}>
        <b>{props.label}</b>
      </Typography>
    )
  } else {
    return (
      <Typography className={classes.stats}>
        <b>{props.label}:</b> {props.value}
        {props.icon && <span className={`icon icon-${props.icon}`} />}
      </Typography>
    )
  }
}

const CostElement = (props: { cost: string | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.cost} label="Cost" />
}

const MilitaryElement = (props: { military: string | undefined }) => {
  return (
    <FormattedValueOrCrossedOut value={props.military} label="Military" icon="conflict-military" />
  )
}

const PoliticalElement = (props: { political: string | undefined }) => {
  return (
    <FormattedValueOrCrossedOut
      value={props.political}
      label="Political"
      icon="conflict-political"
    />
  )
}

const MilitaryBonusElement = (props: { militaryBonus: string | undefined }) => {
  return (
    <FormattedValueOrCrossedOut
      value={props.militaryBonus}
      label="Military Bonus"
      icon="conflict-military"
    />
  )
}

const PoliticalBonusElement = (props: { politicalBonus: string | undefined }) => {
  return (
    <FormattedValueOrCrossedOut
      value={props.politicalBonus}
      label="Political Bonus"
      icon="conflict-political"
    />
  )
}

const GloryElement = (props: { glory: number | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.glory?.toString()} label="Glory" />
}

const StrengthBonusElement = (props: { strengthBonus: string | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.strengthBonus} label="Strength Bonus" />
}

const StrengthElement = (props: { strength: string | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.strength} label="Strength" />
}

const HonorElement = (props: { honor: number | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.honor?.toString()} label="Honor" />
}

const FateElement = (props: { fate: string | undefined }) => {
  return <FormattedValueOrCrossedOut value={'+' + props.fate?.toString()} label="Fate" />
}

const InfluenceElement = (props: { influence: number | undefined }) => {
  return <FormattedValueOrCrossedOut value={props.influence?.toString()} label="Influence" />
}

const ElementsElement = (props: { elements: string[] }) => {
  return (
    <Typography className={classes.stats}>
      <b>Elements: </b>
      {props.elements.map((element) => (
        <ElementSymbol element={element} key={element} />
      ))}
    </Typography>
  )
}

export function CardInformation(props: {
  cardWithVersions: CardWithVersions
  currentVersion?: Omit<CardInPack, 'card_id'>
  clickable?: boolean
}): JSX.Element {
  const navigate = useNavigate()

  const { traits, packs } = useUiStore()
  const card = props.cardWithVersions
  const version = props.currentVersion
  const packName = version && packs.find((pack) => pack.id === version.pack_id)?.name

  const textLines = card.text?.split('\n') || []
  const color = getColorForFactionId(card.faction)

  const goToCardPage = (id: string) => {
    navigate(`/card/${id}`)
  }

  const getCardStatInfo = (card: Card) => {
    if (card.type === 'event') {
      return <CostElement cost={card.cost} />
    }
    if (card.type === 'character') {
      return (
        <span>
          <CostElement cost={card.cost} />
          <MilitaryElement military={card.military} />
          <PoliticalElement political={card.political} />
          <GloryElement glory={card.glory} />
        </span>
      )
    }
    if (card.type === 'warlord') {
      return (
        <span>
          <FateElement fate={card.fate + ' / Player'} />
          <MilitaryElement military={card.military} />
          <PoliticalElement political={card.political} />
          <GloryElement glory={card.glory} />
        </span>
      )
    }
    if (card.type === 'attachment') {
      return (
        <span>
          <CostElement cost={card.cost} />
          <MilitaryBonusElement militaryBonus={card.military_bonus} />
          <PoliticalBonusElement politicalBonus={card.political_bonus} />
        </span>
      )
    }
    if (card.type === 'province') {
      return (
        <span>
          <ElementsElement elements={card.elements || []} />
          <StrengthElement strength={card.strength} />
        </span>
      )
    }
    if (card.type === 'stronghold') {
      return (
        <span>
          <StrengthBonusElement strengthBonus={card.strength_bonus} />
          <HonorElement honor={card.honor} />
          <FateElement fate={card.fate?.toString()} />
          <InfluenceElement influence={card.influence_pool} />
        </span>
      )
    }
    if (card.type === 'holding') {
      return <StrengthBonusElement strengthBonus={card.strength_bonus} />
    }
    return <span />
  }

  return (
    <StyledBox border="solid 1px" padding="15px" borderRadius="3px">
      <Grid container className={classes.block}>
        <Grid size={10}>
          <Typography
            variant="h5"
            style={{ color: color, cursor: props.clickable ? 'pointer' : 'default' }}
            onClick={() => (props.clickable ? goToCardPage(card.id) : {})}
          >
            {card.is_unique && <span className="icon icon-unique" />}
            {card.name}
          </Typography>
          <Typography variant="subtitle1">
            <em>
              <b>
                {capitalize(card.faction)} {capitalize(card.type)}.{' '}
                {convertTraitList(card.traits || [], traits)}
              </b>
            </em>
          </Typography>
        </Grid>
        <Grid size={2}>
          <img src={`/static/svg/clan/${card.faction}.svg`} className={classes.clanMon} />
        </Grid>
      </Grid>
      <Grid container className={classes.block}>
        <Grid size={12}>{getCardStatInfo(card)}</Grid>
      </Grid>
      <Grid container>
        <Grid size={12}>
          <Box borderLeft={`5px solid ${color}`} paddingLeft="10px">
            {textLines.map((line, idx) => (
              <p key={idx}>
                <CardText text={line} />
              </p>
            ))}
          </Box>
        </Grid>
      </Grid>
      <Grid container className={classes.block}>
        <Grid size={12}>
          <Typography className={classes.deckLabel}>
            <span>{capitalize(card.side)} Deck</span>
            {card.side === 'conflict' && (
              <span>
                {card.influence_cost === null
                  ? ' - No Influence Cost'
                  : ` - Influence Cost: ${card.influence_cost}`}
              </span>
            )}
          </Typography>
        </Grid>
      </Grid>
      {version && version.flavor && (
        <Grid container className={classes.block}>
          <Grid size={12}>
            <Typography align="center" className={classes.stats}>
              <i>{version.flavor}</i>
            </Typography>
          </Grid>
        </Grid>
      )}
      {version && (
        <Grid container className={classes.block}>
          <Grid size={12}>
            <Typography className={classes.packInfo}>
              {packName} #{version.position} - Illustrator: {version.illustrator || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      )}
    </StyledBox>
  )
}
