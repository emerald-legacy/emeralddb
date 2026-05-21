import { Checkbox, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useUiStore } from '../providers/UiStoreProvider'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState, type JSX } from 'react'
import { Cycle, Pack } from '@5rdb/api'
import { EmeraldDBLink } from './EmeraldDBLink'
import CachedIcon from '@mui/icons-material/Cached'

const PREFIX = 'CycleList'

const classes = {
  cycle: `${PREFIX}-cycle`,
  pack: `${PREFIX}-pack`,
}

const StyledList = styled(List)(({ theme }) => ({
  [`& .${classes.cycle}`]: {
    paddingLeft: theme.spacing(4),
  },

  [`& .${classes.pack}`]: {
    paddingLeft: theme.spacing(6),
  },
}))

type CycleWithPacks = Cycle & {
  packs: Pack[]
}

export function CycleList(props: {
  onClick?: (route: string) => void
  withCheckbox?: boolean
  onSelection?: (checkedPackIds: string[], checkedCycleIds: string[]) => void
  rootUrl?: string
  packUrl?: string
  cycleUrl?: string
  selectedPacks?: string[]
  selectedCycles?: string[]
  rootLabel: string
}): JSX.Element {
  const { cycles, packs } = useUiStore()
  const [checkedCycleIds, setCheckedCycleIds] = useState<string[]>(props.selectedCycles || [])
  const [checkedPackIds, setCheckedPackIds] = useState<string[]>(props.selectedPacks || [])
  const [allChecked, setAllChecked] = useState(false)
  const [expandedElements, setExpandedElements] = useState(['root'])

  if (
    !allChecked &&
    checkedCycleIds.length === cycles.length &&
    checkedPackIds.length === packs.length
  ) {
    setAllChecked(true)
  }

  function groupPacksByCycle(): CycleWithPacks[] {
    const result: CycleWithPacks[] = []
    cycles.forEach((cycle) => {
      result.push({
        ...cycle,
        packs: packs
          .filter((pack) => pack.cycle_id === cycle.id)
          .sort((a, b) => a.position - b.position),
      })
    })
    result.sort((a, b) => a.position - b.position)
    return result
  }

  const cyclesWithPacks = groupPacksByCycle()

  function removeOrAddPack(packIds: string[], id: string, remove: boolean): string[] {
    const newPackIds = [...packIds]
    const index = newPackIds.indexOf(id)
    if (remove) {
      if (index > -1) {
        newPackIds.splice(index, 1)
      }
    } else {
      if (index === -1) {
        newPackIds.push(id)
      }
    }
    return newPackIds
  }

  function updateCheckedPacksAndCycles(packIds: string[], cycleIds: string[]) {
    setCheckedPackIds(packIds)
    if (props.onSelection) {
      props.onSelection(packIds, cycleIds)
    }
  }

  function checkPack(checked: boolean, pack: Pack) {
    let packIds = [...checkedPackIds]
    packIds = removeOrAddPack(packIds, pack.id, !checked)
    updateCheckedPacksAndCycles(packIds, checkedCycleIds)
  }

  function checkCycle(checked: boolean, cycle: CycleWithPacks) {
    const cycleIds = [...checkedCycleIds]
    let packIds = [...checkedPackIds]
    const index = cycleIds.indexOf(cycle.id)
    if (!checked) {
      if (index > -1) {
        cycleIds.splice(index, 1)
      }
    } else {
      if (index === -1) {
        cycleIds.push(cycle.id)
      }
    }
    cycle.packs.forEach((pack) => {
      packIds = removeOrAddPack(packIds, pack.id, !checked)
    })
    setCheckedCycleIds(cycleIds)
    updateCheckedPacksAndCycles(packIds, cycleIds)
  }

  function checkAll(checked: boolean) {
    const checkedPacks: string[] = []
    const checkedCycles: string[] = []
    if (checked) {
      cyclesWithPacks.forEach((cycle) => {
        cycle.packs.forEach((pack) => {
          checkedPacks.push(pack.id)
        })
        checkedCycles.push(cycle.id)
      })
    }
    setAllChecked(checked)
    setCheckedPackIds(checkedPacks)
    setCheckedCycleIds(checkedCycles)
    updateCheckedPacksAndCycles(checkedPacks, checkedCycles)
  }

  function somePackForCycleChecked(cycle: CycleWithPacks): boolean {
    const checkedCyclePacks = cycle.packs.filter((pack) => checkedPackIds.includes(pack.id))
    if (checkedCyclePacks.length > 0) {
      return true
    }
    return false
  }

  function notAllPacksForCycleChecked(cycle: CycleWithPacks): boolean {
    const checkedCyclePacks = cycle.packs.filter((pack) => checkedPackIds.includes(pack.id))
    if (checkedCyclePacks.length > 0 && checkedCyclePacks.length !== cycle.packs.length) {
      return true
    }
    return false
  }

  function createPackElement(pack: Pack): JSX.Element {
    return (
      <ListItemButton className={classes.pack} key={pack.id}>
        {props.withCheckbox && (
          <ListItemIcon>
            <Checkbox
              checked={checkedPackIds.includes(pack.id)}
              onChange={(event) => checkPack(event.currentTarget.checked, pack)}
              onClick={(e) => e.stopPropagation()}
            />
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <EmeraldDBLink
              href={props.packUrl + pack.id}
              onClick={() => props.onClick && props.onClick(props.packUrl + pack.id)}
              notClickable={!props.packUrl}
            >
              <span>
                {pack.rotated && <CachedIcon style={{ color: 'red', fontSize: 16 }} />} {pack.name}
              </span>
            </EmeraldDBLink>
          }
        />
      </ListItemButton>
    )
  }

  function toggleElementExpanded(element: string) {
    const expanded = [...expandedElements]
    if (expanded.includes(element)) {
      const index = expanded.indexOf(element)
      expanded.splice(index, 1)
    } else {
      expanded.push(element)
    }
    setExpandedElements(expanded)
  }

  function createCycleElement(cycle: CycleWithPacks): JSX.Element {
    return (
      <div key={cycle.id}>
        <ListItemButton onClick={() => toggleElementExpanded(cycle.id)} className={classes.cycle}>
          {props.withCheckbox && (
            <ListItemIcon>
              <Checkbox
                checked={
                  checkedCycleIds.some((item) => item === cycle.id) ||
                  somePackForCycleChecked(cycle)
                }
                indeterminate={notAllPacksForCycleChecked(cycle)}
                onChange={(event) => checkCycle(event.currentTarget.checked, cycle)}
                onClick={(e) => e.stopPropagation()}
              />
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <EmeraldDBLink
                href={props.cycleUrl + cycle.id}
                onClick={() => props.onClick && props.onClick(props.cycleUrl + cycle.id)}
                notClickable={!props.cycleUrl}
              >
                <span>
                  {cycle.rotated && <CachedIcon style={{ color: 'red', fontSize: 16 }} />}{' '}
                  {cycle.name}
                </span>
              </EmeraldDBLink>
            }
          />
          {expandedElements.includes(cycle.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={expandedElements.includes(cycle.id)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {cycle.packs.map((pack) => createPackElement(pack))}
          </List>
        </Collapse>
      </div>
    )
  }

  function createRootElement(): JSX.Element {
    return (
      <StyledList dense>
        <ListItemButton onClick={() => toggleElementExpanded('root')}>
          {props.withCheckbox && (
            <ListItemIcon>
              <Checkbox
                checked={allChecked}
                onChange={(event) => checkAll(event.currentTarget.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <EmeraldDBLink
                href={props.rootUrl || ''}
                onClick={() => props.onClick && props.onClick(props.rootUrl || '')}
                notClickable={!props.rootUrl}
              >
                {props.rootLabel}
              </EmeraldDBLink>
            }
          />
          {expandedElements.includes('root') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={expandedElements.includes('root')} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {cyclesWithPacks.map((cycle) => createCycleElement(cycle))}
          </List>
        </Collapse>
      </StyledList>
    )
  }

  return createRootElement()
}
