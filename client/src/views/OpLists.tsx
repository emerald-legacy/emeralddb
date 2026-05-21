import { useUiStore } from '../providers/UiStoreProvider'
import { useState, type JSX } from 'react'
import { Box, Grid, List, ListItem, TextField, Typography } from '@mui/material'
import { Loading } from '../components/Loading'
import Autocomplete from '@mui/material/Autocomplete'
import { clans } from '../utils/enums'
import { OrganizedPlayList } from '../components/OrganizedPlayList'
import { CardWithVersions } from '@5rdb/api'
import { useNavigate, useParams } from 'react-router'
import { CardLink } from '../components/card/CardLink'

const formats = [
  {
    id: 'emerald',
    name: 'Emerald Legacy - Emerald Edict',
    link: 'https://emerald-legacy.github.io/rules-documents/Emerald%20Edict.pdf',
  },
  {
    id: 'standard',
    name: 'Fantasy Flight Games - Imperial Law',
    link: 'https://images-cdn.fantasyflightgames.com/filer_public/61/f1/61f18d82-b566-47a7-bc65-3fe068e3194b/l5c01-online_imperiallaw_final.pdf',
  },
]

function isSplashBanned(card: CardWithVersions, format: string, filterClan: string): boolean {
  if (!card.splash_banned_in?.includes(format)) {
    return false
  }
  return card.faction !== filterClan
}

export function OpLists(): JSX.Element {
  const params = useParams<{ format: string }>()
  const { cards, cycles, packs } = useUiStore()
  const [format, setFormat] = useState(params.format! || '')
  const [filterClan, setFilterClan] = useState('')
  const navigate = useNavigate()

  if (!cards) {
    return <Loading />
  }
  if (params.format! && params.format! !== format) {
    setFormat(params.format!)
  }
  const formatName = formats.find((f) => f.id === format)?.name || ''
  const formatLink = formats.find((f) => f.id === format)?.link || ''

  const allCards =
    !filterClan || !format
      ? cards
      : cards.filter(
          (c) => c.allowed_clans?.includes(filterClan) && !isSplashBanned(c, format, filterClan)
        )

  const restrictedCards = format ? allCards.filter((c) => c.restricted_in?.includes(format)) : []
  const bannedCards = format ? allCards.filter((c) => c.banned_in?.includes(format)) : []
  const splashBannedCards = format
    ? allCards.filter((c) => c.splash_banned_in?.includes(format))
    : []
  const rotatedCards =
    format === 'emerald'
      ? allCards
          .filter((c) => c.versions.length > 0)
          .filter((c) => !c.versions.find((v) => !v.rotated))
      : []

  const rotatedCardsByPack = (packId: string) => {
    return rotatedCards.filter((c) => c.versions.some((v) => v.pack_id === packId))
  }

  const rotatedCardsByCycle = (cycleId: string) => {
    const packsOfCycle = packs.filter((p) => p.cycle_id === cycleId)
    return packsOfCycle.flatMap((p) => rotatedCardsByPack(p.id))
  }

  const sortedCycles = cycles.sort((a, b) => a.position - b.position)

  return (
    <>
      <Grid container spacing={4}>
        <Grid size={12}>
          <Typography variant="h4">Organized Play: Restricted and Banned Lists</Typography>
          <Typography>
            Below you can find the current Restricted and Banned Lists for the Legend of the Five
            Rings LCG.
          </Typography>
        </Grid>
        <Grid size={6}>
          <Typography style={{ marginBottom: 5 }}>
            Please select the set of rules you are interested in:
          </Typography>
          <Autocomplete
            id="combo-box-format"
            autoHighlight
            options={formats}
            getOptionLabel={(option) => option.name}
            value={formats.find((item) => item.id === format) || null}
            renderInput={(params) => <TextField {...params} label="Format" variant="outlined" />}
            onChange={(e, value) => {
              const newPathParam = value?.id || ''
              setFormat(newPathParam)
              navigate(`/rules/organized-play/${newPathParam}`)
            }}
          />
        </Grid>
        <Grid hidden={!format} size={6}>
          <Typography style={{ marginBottom: 5 }}>
            Only show cards playable by this clan:
          </Typography>
          <Autocomplete
            id="combo-box-clan"
            autoHighlight
            options={clans}
            getOptionLabel={(option) => option.name}
            value={clans.find((item) => item.id === filterClan) || null}
            renderInput={(params) => <TextField {...params} label="Clan" variant="outlined" />}
            onChange={(e, value) => setFilterClan(value?.id || '')}
          />
        </Grid>
        <Grid hidden={!format} size={12}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant={'h5'}>{formatName}</Typography>
              {formatLink && (
                <Typography component={'a'} href={formatLink} target={'_blank'}>
                  Link to the PDF version
                </Typography>
              )}
            </Grid>
            <Grid hidden={bannedCards.length === 0} size={{ xs: 12, md: 6, lg: 4 }}>
              <OrganizedPlayList
                cards={bannedCards}
                format={format}
                title="Banned List"
                description="You may not include any banned cards in your deck."
              />
            </Grid>
            <Grid hidden={restrictedCards.length === 0} size={{ xs: 12, md: 6, lg: 4 }}>
              <OrganizedPlayList
                cards={restrictedCards}
                format={format}
                title="Restricted List"
                description="You may only include one restricted card in your deck."
              />
            </Grid>
            <Grid hidden={splashBannedCards.length === 0} size={{ xs: 12, md: 6, lg: 4 }}>
              <OrganizedPlayList
                cards={splashBannedCards}
                format={format}
                title="Splash Banned List"
                description="These cards have their influence removed and cannot be splashed."
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={2} hidden={format !== 'emerald'} size={12}>
          <Grid size={12}>
            <Typography>
              <b>Rotated Cards</b>
            </Typography>
            <Typography>
              These cards have been rotated out of the Emerald Legacy card pool and cannot be
              included in your deck.
            </Typography>
          </Grid>
          {sortedCycles.map((cycle) => {
            const rotatedCardsOfCycle = rotatedCardsByCycle(cycle.id).sort((a, b) =>
              a.name.localeCompare(b.name)
            )
            return (
              <Grid
                key={cycle.id}
                hidden={rotatedCardsOfCycle.length === 0}
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              >
                <Box border="1px solid gray" borderRadius="4px" p={2}>
                  <Typography>
                    <b>Cycle: {cycle.name}</b> ({rotatedCardsOfCycle.length})
                  </Typography>
                  <List dense>
                    {rotatedCardsOfCycle.map((card) => (
                      <ListItem key={card.id}>
                        <CardLink cardId={card.id} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </>
  )
}
