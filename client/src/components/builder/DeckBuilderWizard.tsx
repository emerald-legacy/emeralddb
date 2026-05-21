import { DecklistViewModel, Format } from '@5rdb/api'
import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { useState, type JSX } from 'react'
import { useUiStore } from '../../providers/UiStoreProvider'
import { clans } from '../../utils/enums'
import { CardLink } from '../card/CardLink'
import { JigokuImportButton } from './JigokuImportButton'
import { EmeraldDBImportButton } from './EmeraldDBImportButton'
import { CardFactionIcon } from '../card/CardFactionIcon'
import { FormatWithInfo } from '../format/FormatWithInfo'

export function DeckBuilderWizard(props: {
  onComplete: (
    format: string,
    primaryClan: string,
    strongholdAndRole: Record<string, number>
  ) => void
  onImport: (decklist: DecklistViewModel) => void
}): JSX.Element {
  const { cards, relevantFormats } = useUiStore()

  const [step, setStep] = useState(-1)
  const [format, setFormat] = useState('')
  const [primaryClan, setPrimaryClan] = useState('')
  const [stronghold, setStronghold] = useState('')
  const [role, setRole] = useState('')
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  const chosenFormat = format && relevantFormats.find((f) => f.id === format)
  const strongholds = cards
    .filter((c) => c.faction === primaryClan && c.type === 'stronghold')
    .filter((c) => {
      if (!chosenFormat) return true
      if (!chosenFormat.legal_packs || chosenFormat.legal_packs.length === 0) return true
      return chosenFormat.legal_packs.some((packId) => c.versions.some((v) => v.pack_id === packId))
    })
  const roles = cards.filter((c) => c.type === 'role' && !c.text?.includes('Draft format only.'))

  const host = window.location.host
  const isProduction = !host.includes('localhost') && !host.includes('beta-')

  const isButtonDisabled = () => {
    if (
      (step === 0 && format === '') ||
      (step === 1 && primaryClan === '') ||
      (step === 2 && stronghold === '') ||
      (step === 3 && role === '')
    ) {
      return true
    }
    return false
  }
  const lastStep = format !== 'skirmish' ? 3 : 1

  const completeWizard = () => {
    const strongholdAndRole: Record<string, number> = {}
    if (stronghold !== '') {
      strongholdAndRole[stronghold] = 1
    }
    if (role !== '') {
      strongholdAndRole[role] = 1
    }
    props.onComplete(format, primaryClan, strongholdAndRole)
  }

  const handleBack = () => {
    const newStep = step - 1
    setStep(newStep)

    // Clear the selection from the step we're leaving
    if (step === 0) {
      setFormat('')
    } else if (step === 1) {
      setPrimaryClan('')
    } else if (step === 2) {
      setStronghold('')
    } else if (step === 3) {
      setRole('')
    }
  }

  function sortFormats(a: Format, b: Format): number {
    return a.position - b.position || a.id.localeCompare(b.id)
  }

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
      <Grid hidden={step > -1} size={{ xs: 12, md: 4 }}>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          Create New Deck
        </Typography>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Button fullWidth variant="contained" color="secondary" onClick={() => setStep(0)}>
              Start From Scratch
            </Button>
          </Grid>
          <Grid size={12}>
            <Typography align="center"> --- OR --- </Typography>
          </Grid>
          {!isProduction && (
            <Grid size={12}>
              <EmeraldDBImportButton
                onImport={(decklist: DecklistViewModel) => props.onImport(decklist)}
              />
            </Grid>
          )}
          <Grid size={12}>
            <JigokuImportButton
              onImport={(decklist: DecklistViewModel) => props.onImport(decklist)}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid hidden={step < 0} size={{ xs: 12, md: 12 }}>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          Create New Deck
        </Typography>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="center">
              Choose Format
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat((e.target as HTMLInputElement).value)}
            >
              {relevantFormats.sort(sortFormats).map((format) => (
                <FormControlLabel
                  key={format.id}
                  value={format.id}
                  control={<Radio />}
                  label={
                    <div onClick={() => setFormat(format.id)} style={{ cursor: 'pointer' }}>
                      <FormatWithInfo format={format} />
                    </div>
                  }
                  onClick={() => setFormat(format.id)}
                />
              ))}
            </RadioGroup>
          </div>
        )}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="center">
              Choose Clan
            </Typography>
            <RadioGroup
              value={primaryClan}
              onChange={(e) => setPrimaryClan((e.target as HTMLInputElement).value)}
            >
              {clans.map((clan) => (
                <FormControlLabel
                  key={clan.id}
                  value={clan.id}
                  control={<Radio />}
                  label={
                    <span
                      onClick={() => setPrimaryClan(clan.id)}
                      style={{ fontSize: 18, cursor: 'pointer' }}
                    >
                      <CardFactionIcon faction={clan.id} colored /> {clan.name}
                    </span>
                  }
                  onClick={() => setPrimaryClan(clan.id)}
                />
              ))}
            </RadioGroup>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="center">
              Choose Stronghold
            </Typography>
            <RadioGroup
              value={stronghold}
              onChange={(e) => setStronghold((e.target as HTMLInputElement).value)}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              {strongholds.map((thisStronghold) => (
                <FormControlLabel
                  key={thisStronghold.id}
                  value={thisStronghold.id}
                  control={<Radio />}
                  label={
                    <div
                      onMouseEnter={() => setHoveredCardId(thisStronghold.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setStronghold(thisStronghold.id)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <CardLink
                        cardId={thisStronghold.id}
                        format={format}
                        notClickable
                        sameTab
                        hoveredCardId={hoveredCardId}
                      />
                    </div>
                  }
                  onClick={() => setStronghold(thisStronghold.id)}
                />
              ))}
            </RadioGroup>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="center">
              Choose Role
            </Typography>
            <Grid
              container
              spacing={{ xs: 0, sm: 2 }}
              style={{ minWidth: 550 }}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              onMouseLeave={() => setHoveredCardId(null)}
            >
              <Grid
                size={{ xs: 12, sm: 6 }}
                display="flex"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <RadioGroup
                  value={role}
                  onChange={(e) => setRole((e.target as HTMLInputElement).value)}
                  sx={{ width: 320 }}
                >
                  {roles.slice(0, 10).map((thisRole) => (
                    <FormControlLabel
                      key={thisRole.id}
                      value={thisRole.id}
                      control={<Radio />}
                      sx={{
                        marginBottom: 1,
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': { paddingLeft: 0 },
                      }}
                      label={
                        <div
                          onMouseEnter={() => setHoveredCardId(thisRole.id)}
                          onMouseLeave={() => setHoveredCardId(null)}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setRole(thisRole.id)
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <CardLink
                            cardId={thisRole.id}
                            format={format}
                            notClickable
                            sameTab
                            hoveredCardId={hoveredCardId}
                          />
                        </div>
                      }
                      onClick={() => setRole(thisRole.id)}
                    />
                  ))}
                </RadioGroup>
              </Grid>
              <Grid
                size={{ xs: 12, sm: 6 }}
                display="flex"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <RadioGroup
                  value={role}
                  onChange={(e) => setRole((e.target as HTMLInputElement).value)}
                  sx={{ width: 320 }}
                >
                  {roles.slice(10).map((thisRole) => (
                    <FormControlLabel
                      key={thisRole.id}
                      value={thisRole.id}
                      control={<Radio />}
                      sx={{
                        marginBottom: 1,
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': { paddingLeft: 0 },
                      }}
                      label={
                        <div
                          onMouseEnter={() => setHoveredCardId(thisRole.id)}
                          onMouseLeave={() => setHoveredCardId(null)}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setRole(thisRole.id)
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <CardLink
                            cardId={thisRole.id}
                            format={format}
                            notClickable
                            sameTab
                            hoveredCardId={hoveredCardId}
                          />
                        </div>
                      }
                      onClick={() => setRole(thisRole.id)}
                    />
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>
          </div>
        )}
      </Grid>
      {step >= 0 && (
        <Grid size={{ xs: 12, md: 12 }} container justifyContent="center">
          <Grid size="auto">
            <Stepper connector={null} sx={{ gap: 1 }}>
              <Step completed={format !== ''}>
                <StepLabel>Format</StepLabel>
              </Step>
              <Step completed={primaryClan !== ''}>
                <StepLabel>Clan</StepLabel>
              </Step>
              {lastStep > 1 && (
                <Step completed={stronghold !== ''}>
                  <StepLabel>Stronghold</StepLabel>
                </Step>
              )}
              {lastStep > 1 && (
                <Step completed={role !== ''}>
                  <StepLabel>Role</StepLabel>
                </Step>
              )}
            </Stepper>
          </Grid>
        </Grid>
      )}
      <Grid hidden={step < 0} size={{ xs: 12, md: 6 }}>
        <Grid container spacing={2} direction="row" justifyContent="center">
          <Grid size="auto">
            {step >= 0 && (
              <Button variant="contained" onClick={handleBack}>
                Back
              </Button>
            )}
          </Grid>
          <Grid size="auto">
            {step < lastStep && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setStep(step + 1)}
                disabled={isButtonDisabled()}
              >
                Next
              </Button>
            )}
            {step === lastStep && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => completeWizard()}
                disabled={isButtonDisabled()}
              >
                Finish
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
