import { Grid, TextField, Typography } from '@mui/material'
import { useState, type JSX } from 'react'

function splitVersion(version: string): { major: string; minor: string; extra: string } {
  const versionParts = version.split('.')
  if (versionParts.length < 2) {
    throw Error('Invalid Version number')
  }
  return {
    major: versionParts[0],
    minor: versionParts[1],
    extra: versionParts[2] || '',
  }
}

export function VersionPicker(props: {
  version: string
  onVersionChange: (version: string) => void
}): JSX.Element {
  const { major, minor, extra } = splitVersion(props.version)
  const existingMajor = Number.parseInt(major)
  const existingMinor = Number.parseInt(minor)
  const [majorVersion, setMajorVersion] = useState(existingMajor)
  const [minorVersion, setMinorVersion] = useState(existingMinor)
  const [extraVersion, setExtraVersion] = useState(extra)

  function createVersionStringAndSendChangeEvent(major: number, minor: number, extra: string) {
    let versionNumber = `${major}.${minor}`
    if (extra) {
      versionNumber += `.${extra}`
    }
    props.onVersionChange(versionNumber)
  }

  function updateMajorVersion(newMajor: number) {
    if (newMajor >= existingMajor) {
      setMajorVersion(newMajor)
      const newMinor = newMajor === existingMajor ? existingMinor : 0
      setMinorVersion(newMinor)
      createVersionStringAndSendChangeEvent(newMajor, newMinor, extraVersion)
    }
  }

  function updateMinorVersion(newMinor: number) {
    if (newMinor >= existingMinor) {
      setMinorVersion(newMinor)
      createVersionStringAndSendChangeEvent(majorVersion, newMinor, extraVersion)
    }
  }

  function updateExtraVersion(newExtra: string) {
    setExtraVersion(newExtra)
    createVersionStringAndSendChangeEvent(majorVersion, minorVersion, newExtra)
  }

  return (
    <Grid container spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
      <Grid size={3.5}>
        <TextField
          id="major"
          label="Major"
          variant="outlined"
          size="small"
          value={majorVersion}
          type="number"
          fullWidth
          onChange={(e) => updateMajorVersion(Number.parseInt(e.target.value) || 0)}
        />
      </Grid>
      <Grid size={0.5}>
        <Typography align="center">
          <b>.</b>
        </Typography>
      </Grid>
      <Grid size={3.5}>
        <TextField
          id="minor"
          label="Minor"
          variant="outlined"
          size="small"
          value={minorVersion}
          type="number"
          fullWidth
          onChange={(e) => updateMinorVersion(Number.parseInt(e.target.value) || 0)}
        />
      </Grid>
      <Grid size={0.5}>
        <Typography align="center">
          <b>.</b>
        </Typography>
      </Grid>
      <Grid size={4}>
        <TextField
          id="extra"
          label="Extra"
          variant="outlined"
          size="small"
          value={extraVersion}
          fullWidth
          onChange={(e) => updateExtraVersion(e.target.value)}
        />
      </Grid>
    </Grid>
  )
}
