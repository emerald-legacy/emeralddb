import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@mui/material'

import type { JSX } from 'react'

export function MultiCheckbox(props: {
  label: string
  items: { id: string; name: string }[]
  onChange: (formats: string[]) => void
  defaultItems?: string[]
}): JSX.Element {
  let chosenItems = props.defaultItems || []

  const isChecked = (id: string) => {
    return chosenItems.includes(id)
  }

  const check = (id: string) => {
    const newItems = [...chosenItems]
    if (isChecked(id)) {
      const index = newItems.indexOf(id)
      newItems.splice(index, 1)
    } else {
      newItems.push(id)
    }
    chosenItems = newItems
    props.onChange(newItems)
  }

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{props.label}</FormLabel>
      <FormGroup>
        {props.items.map((item) => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                checked={isChecked(item.id)}
                onChange={() => check(item.id)}
                name={item.name}
              />
            }
            label={item.name}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}
