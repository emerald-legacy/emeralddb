import { useUiStore } from '../providers/UiStoreProvider'
import { useState, type JSX } from 'react'
import { Box, Grid, List, ListItem, TextField, Typography } from '@mui/material'
import { Loading } from '../components/Loading'
import Autocomplete from '@mui/material/Autocomplete'
import { clans } from '../utils/enums'
import { OrganizedPlayList } from '../components/OrganizedPlayList'
import { useNavigate, useParams } from 'react-router'
import { CardLink } from '../components/card/CardLink'
import { getCardLegality } from '../utils/legalityUtils'
import type { Format } from '@5rdb/api'

const emeraldEdict = {
  name: 'Emerald Legacy - Emerald Edict',
  link: 'https://emerald-legacy.github.io/rules-documents/Emerald%20Edict.html',
}

const imperialLaw = {
  name: 'Fantasy Flight Games - Imperial Law',
  link: 'https://images-cdn.fantasyflightgames.com/filer_public/61/f1/61f18d82-b566-47a7-bc65-3fe068e3194b/l5c01-online_imperiallaw_final.pdf',
}

// Documents that publish the banned and restricted lists of a format
const ruleDocuments: Record<string, { name: string; link: string }> = {
  emerald: emeraldEdict,
  standard: imperialLaw,
  skirmish: imperialLaw,
  enlightenment: imperialLaw,
}

export function OpLists(): JSX.Element {
  const params = useParams<{ format: string }>()
  const { cards, cycles, packs, relevantFormats } = useUiStore()
  const [format, setFormat] = useState(params.format || 'emerald')
  const [filterClan, setFilterClan] = useState('')
  const navigate = useNavigate()

  if (!cards) {
    return <Loading />
  }
  if (params.format! && params.format! !== format) {
    setFormat(params.format!)
  }
  const sortedFormats = [...relevantFormats].sort((a, b) => a.position - b.position)
  const chosenFormat = sortedFormats.find((f) => f.id === format)
  const ruleDocument = ruleDocuments[format]

  const allCards = !filterClan ? cards : cards.filter((c) => c.allowed_clans?.includes(filterClan))

  // Cards that are rotated out of or not part of the card pool are left out of the lists
  const cardsWithLegality = (legality: 'banned' | 'restricted') =>
    chosenFormat ? allCards.filter((c) => getCardLegality(c, chosenFormat) === legality) : []
  const restrictedCards = cardsWithLegality('restricted')
  const bannedCards = cardsWithLegality('banned')
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
            Please select the format you are interested in:
          </Typography>
          <Autocomplete
            id="combo-box-format"
            autoHighlight
            disableClearable
            options={sortedFormats}
            getOptionLabel={(option) => option.name}
            // null keeps the input controlled while no format matches the URL
            value={chosenFormat ?? (null as unknown as Format)}
            renderInput={(params) => <TextField {...params} label="Format" variant="outlined" />}
            onChange={(e, value) => {
              setFormat(value.id)
              navigate(`/rules/organized-play/${value.id}`)
            }}
          />
        </Grid>
        <Grid hidden={!chosenFormat} size={6}>
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
        <Grid hidden={!chosenFormat} size={12}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant={'h5'}>{chosenFormat?.name}</Typography>
              {ruleDocument ? (
                <Typography component={'a'} href={ruleDocument.link} target={'_blank'}>
                  {ruleDocument.name}
                </Typography>
              ) : (
                chosenFormat?.info_link && (
                  <Typography component={'a'} href={chosenFormat.info_link} target={'_blank'}>
                    More information about this format
                  </Typography>
                )
              )}
            </Grid>
            {bannedCards.length > 0 && (
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <OrganizedPlayList
                  cards={bannedCards}
                  format={format}
                  title="Banned List"
                  description="You may not include any banned cards in your deck."
                />
              </Grid>
            )}
            {restrictedCards.length > 0 && (
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <OrganizedPlayList
                  cards={restrictedCards}
                  format={format}
                  title="Restricted List"
                  description="You may only include one restricted card in your deck."
                />
              </Grid>
            )}
            {bannedCards.length === 0 && restrictedCards.length === 0 && (
              <Grid size={12}>
                <Typography>This format has no banned or restricted cards.</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        {format === 'emerald' && (
          <Grid container spacing={2} size={12}>
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
                  <Box
                    sx={{
                      border: '1px solid gray',
                      borderRadius: '4px',
                      p: 2,
                    }}
                  >
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
        )}
      </Grid>
    </>
  )
}
