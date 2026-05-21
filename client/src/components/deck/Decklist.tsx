import { Deck, DecklistViewModel } from '@5rdb/api'
import { Box, Button, Grid, Switch, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { privateApi } from '../../api'
import { useUiStore } from '../../providers/UiStoreProvider'
import { useCurrentUser } from '../../providers/UserProvider'
import { CardLink } from '../card/CardLink'
import { InfluenceElement } from '../card/InfluenceElement'
import { useSnackbar } from 'notistack'
import { CardWithQuantity, createDeckStatistics } from './DeckValidator'
import { CardQuantitySelector } from '../builder/CardQuantitySelector'
import min from 'lodash/min'
import { Loading } from '../Loading'
import { useState, type JSX } from 'react'
import { CardFactionIcon } from '../card/CardFactionIcon'
import { getImageUrl } from '../../utils/imageUrl'

export function DeckCardSubList(props: {
  cards: CardWithQuantity[]
  faction?: string | undefined
  format: string
  cardPackIds?: Record<string, string>
  onQuantityChange?: ((cardId: string, quantity: number) => void) | undefined
  sortByName: boolean
}): JSX.Element {
  let list
  if (!props.sortByName) {
    list = props.cards.sort(
      (a, b) => a.cost?.localeCompare(b.cost || '') || a.name.localeCompare(b.name)
    )
  } else {
    list = props.cards.sort((a, b) => a.name.localeCompare(b.name))
  }
  return (
    <>
      {list.map((card) => (
        <Typography variant="subtitle2" key={card.id}>
          {props.onQuantityChange ? (
            <CardQuantitySelector
              deckLimit={
                props.format === 'skirmish' || props.format === 'obsidian'
                  ? min([2, card.deck_limit]) || 2
                  : card.deck_limit
              }
              onQuantityChange={(newQuantity) => props.onQuantityChange!(card.id, newQuantity)}
              quantity={card.quantity}
            />
          ) : (
            `${card.quantity}x`
          )}{' '}
          <CardLink cardId={card.id} format={props.format} packId={props.cardPackIds?.[card.id]} />
          {props.faction && card.faction !== props.faction && (
            <>
              {' '}
              <InfluenceElement
                faction={card.faction}
                influence={(card.influence_cost || -1) * card.quantity}
              />
            </>
          )}
        </Typography>
      ))}
    </>
  )
}

export function ProvinceCardSubList(props: {
  cards: CardWithQuantity[]
  format: string
  cardPackIds?: Record<string, string>
  onQuantityChange?: ((cardId: string, quantity: number) => void) | undefined
}): JSX.Element {
  const list = props.cards.sort((a, b) => a.name.localeCompare(b.name))
  return (
    <>
      {list.map((card) => (
        <Typography variant="subtitle2" key={card.id}>
          {props.onQuantityChange && (
            <CardQuantitySelector
              deckLimit={1}
              onQuantityChange={(newQuantity) => props.onQuantityChange!(card.id, newQuantity)}
              quantity={card.quantity}
            />
          )}
          <CardLink
            cardId={card.id}
            format={props.format}
            packId={props.cardPackIds?.[card.id]}
          />{' '}
        </Typography>
      ))}
    </>
  )
}

export function DeckCardSubListWithTitle(props: {
  cards: CardWithQuantity[]
  title: string
  faction?: string
  format: string
  cardPackIds?: Record<string, string>
  sortByName?: boolean
  onQuantityChange?: ((cardId: string, quantity: number) => void) | undefined
}): JSX.Element {
  const quantity = props.cards.map((card) => card.quantity).reduce((a, b) => a + b, 0)
  return (
    <>
      <Typography variant="subtitle2">
        <b>
          {props.title} ({quantity})
        </b>
      </Typography>
      <DeckCardSubList
        cards={props.cards}
        faction={props.faction}
        format={props.format}
        cardPackIds={props.cardPackIds}
        onQuantityChange={props.onQuantityChange}
        sortByName={props.sortByName || false}
      />
    </>
  )
}

function ProvinceCardSubListWithTitle(props: {
  cards: CardWithQuantity[]
  title: string
  format: string
  cardPackIds?: Record<string, string>
  onQuantityChange?: ((cardId: string, quantity: number) => void) | undefined
}): JSX.Element {
  const quantity = props.cards.map((card) => card.quantity).reduce((a, b) => a + b, 0)
  return (
    <>
      <Typography variant="subtitle2">
        <b>
          {props.title} ({quantity})
        </b>
      </Typography>
      <ProvinceCardSubList
        cards={props.cards}
        format={props.format}
        cardPackIds={props.cardPackIds}
        onQuantityChange={props.onQuantityChange}
      />
    </>
  )
}

export function Decklist(props: {
  decklist: DecklistViewModel
  withoutHeader?: boolean
  onQuantityChange?: ((cardId: string, quantity: number) => void) | undefined
}): JSX.Element {
  const { cards, formats } = useUiStore()
  const { isLoggedIn } = useCurrentUser()
  const { enqueueSnackbar } = useSnackbar()
  const [sortDynByName, setSortDynByName] = useState(false)
  const [sortConfByName, setSortConfByName] = useState(false)
  const navigate = useNavigate()
  const { decklist } = props

  if (cards.length === 0) {
    return <Loading />
  }

  function copyDeck() {
    privateApi.Deck.create({
      body: {
        forkedFrom: decklist.id,
      },
    })
      .then((response) => {
        const newDeck = response.data() as Deck
        navigate(`/builder/${newDeck.id}/edit`)
        enqueueSnackbar('Successfully copied deck!', { variant: 'success' })
      })
      .catch((error) => {
        enqueueSnackbar('Error while copying deck: ' + error, { variant: 'error' })
      })
  }

  const stats = createDeckStatistics(decklist.cards, decklist.format, cards, formats)
  const { dynastyCharacters, dynastyEvents, holdings } = stats.dynastyCards
  const { conflictCharacters, conflictEvents, attachments } = stats.conflictCards

  const illegalDynastySize =
    stats.dynastyCards.size < stats.dynastyDeckMinimum ||
    stats.dynastyCards.size > stats.deckMaximum
  const illegalConflictSize =
    stats.conflictCards.size < stats.conflictDeckMinimum ||
    stats.conflictCards.size > stats.deckMaximum

  return (
    <Grid container spacing={2}>
      <Grid hidden={stats.validationErrors.length === 0} size={12}>
        <Box
          p={1}
          border="1px solid"
          borderColor="red"
          borderRadius="4px"
          bgcolor="pink"
          fontSize={12}
        >
          {stats.validationErrors.map((error) => (
            <Typography variant="caption" key={error}>
              {error}
              <br />
            </Typography>
          ))}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
        {stats.stronghold && (
          <img
            src={getImageUrl(
              (decklist.card_pack_ids?.[stats.stronghold.id]
                ? stats.stronghold.versions.find(
                    (v) => v.pack_id === decklist.card_pack_ids![stats.stronghold!.id]
                  )
                : undefined
              )?.image_url || stats.stronghold.versions[0]?.image_url
            )}
            style={{ width: '80%', maxWidth: '250px', height: 'auto' }}
            alt={stats.stronghold.name}
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
        <Grid
          container
          justifyContent="space-between"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid>
            {!props.withoutHeader && isLoggedIn() && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => copyDeck()}
                style={{ margin: 1 }}
                fullWidth
                size="small"
              >
                Copy Deck
              </Button>
            )}
            {!props.withoutHeader && (
              <>
                <Typography variant="h4">
                  {decklist.name} (v{decklist.version_number})
                </Typography>
                <Typography variant="h4">
                  {stats.primaryClan && <CardFactionIcon faction={stats.primaryClan} colored />}{' '}
                  {stats.secondaryClan && <CardFactionIcon faction={stats.secondaryClan} colored />}
                </Typography>
              </>
            )}
            {stats.format !== 'skirmish' && (
              <div>
                <div>
                  <Typography>
                    Format: {formats.find((format) => format.id === stats.format)?.name || 'N/A'}
                  </Typography>
                </div>
                <div>
                  {stats.stronghold && (
                    <b>
                      <CardLink
                        cardId={stats.stronghold.id}
                        format={stats.format}
                        packId={decklist.card_pack_ids?.[stats.stronghold.id]}
                      />
                    </b>
                  )}
                </div>
                <div>
                  {stats.role && (
                    <CardLink
                      cardId={stats.role.id}
                      format={stats.format}
                      packId={decklist.card_pack_ids?.[stats.role.id]}
                    />
                  )}
                </div>
                <ProvinceCardSubListWithTitle
                  cards={stats.provinces}
                  title="Provinces"
                  format={stats.format}
                  cardPackIds={decklist.card_pack_ids}
                  onQuantityChange={props.onQuantityChange}
                />
              </div>
            )}
          </Grid>
          <Grid>
            Influence: {stats.usedInfluence}/{stats.maxInfluence}
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="subtitle1" color={illegalDynastySize ? 'error' : 'inherit'}>
          <b>Dynasty Cards ({stats.dynastyCards.size})</b>
        </Typography>
        <Typography variant="subtitle2">
          Minimum: {stats.dynastyDeckMinimum}, Maximum: {stats.deckMaximum}
        </Typography>
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid>
            <Typography variant="subtitle2">Sort By Cost</Typography>
          </Grid>
          <Grid>
            <Switch
              size="small"
              checked={sortDynByName}
              onChange={() => setSortDynByName(!sortDynByName)}
            />
          </Grid>
          <Grid>
            <Typography variant="subtitle2">Sort By Name</Typography>
          </Grid>
        </Grid>
        <DeckCardSubListWithTitle
          cards={dynastyCharacters}
          title="Characters"
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
          sortByName={sortDynByName}
        />
        <DeckCardSubListWithTitle
          cards={dynastyEvents}
          title="Events"
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
          sortByName={sortDynByName}
        />
        <DeckCardSubListWithTitle
          cards={holdings}
          title="Holdings"
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="subtitle1" color={illegalConflictSize ? 'error' : 'inherit'}>
          <b>Conflict Cards ({stats.conflictCards.size})</b>
        </Typography>
        <Typography variant="subtitle2">
          Minimum: {stats.conflictDeckMinimum}, Maximum: {stats.deckMaximum}
        </Typography>
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid>
            <Typography variant="subtitle2">Sort By Cost</Typography>
          </Grid>
          <Grid>
            <Switch
              size="small"
              checked={sortConfByName}
              onChange={() => setSortConfByName(!sortConfByName)}
            />
          </Grid>
          <Grid>
            <Typography variant="subtitle2">Sort By Name</Typography>
          </Grid>
        </Grid>
        <DeckCardSubListWithTitle
          cards={conflictEvents}
          title="Events"
          faction={stats.primaryClan}
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
          sortByName={sortConfByName}
        />
        <DeckCardSubListWithTitle
          cards={attachments}
          title="Attachments"
          faction={stats.primaryClan}
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
          sortByName={sortConfByName}
        />
        <DeckCardSubListWithTitle
          cards={conflictCharacters}
          title="Characters"
          faction={stats.primaryClan}
          format={stats.format}
          cardPackIds={decklist.card_pack_ids}
          onQuantityChange={props.onQuantityChange}
          sortByName={sortConfByName}
        />
      </Grid>
    </Grid>
  )
}
