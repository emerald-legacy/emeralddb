import React, { useRef, type JSX } from 'react'
import { styled } from '@mui/material/styles'
import clsx from 'clsx'
import TableCell from '@mui/material/TableCell'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CardQuantitySelector } from './CardQuantitySelector'
import { CardLink } from '../card/CardLink'
import { InfluenceElement } from '../card/InfluenceElement'

const PREFIX = 'VirtualizedCardTable'

const classes = {
  flexContainer: `${PREFIX}-flexContainer`,
  table: `${PREFIX}-table`,
  tableRow: `${PREFIX}-tableRow`,
  tableRowHover: `${PREFIX}-tableRowHover`,
  tableCell: `${PREFIX}-tableCell`,
  noClick: `${PREFIX}-noClick`,
  container: `${PREFIX}-container`,
  header: `${PREFIX}-header`,
}

const StyledContainer = styled('div')(({ theme }) => ({
  height: '100%',
  width: '100%',
  overflow: 'auto',

  [`& .${classes.flexContainer}`]: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },

  [`& .${classes.table}`]: {
    width: '100%',
  },

  [`& .${classes.header}`]: {
    display: 'flex',
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.tableRow}`]: {
    display: 'flex',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.tableRowHover}`]: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },

  [`& .${classes.tableCell}`]: {
    padding: 0,
  },

  [`& .${classes.noClick}`]: {
    cursor: 'initial',
  },
}))

export interface ColumnData {
  columnType:
    | 'quantityForId'
    | 'nameFactionType'
    | 'traits'
    | 'influenceAndFaction'
    | 'cost'
    | 'mil'
    | 'pol'
    | 'glory'
    | 'strength'
  label: string
  width: number
}

interface Row {
  index: number
}

interface MuiVirtualizedTableProps {
  columns: ColumnData[]
  headerHeight?: number
  onRowClick?: () => void
  rowCount: number
  rowGetter: (row: Row) => TableCardData
  rowHeight?: number
}

const cellRenderer = (
  cellData: any,
  columnType: string,
  width: number,
  rowHeight: number,
  onRowClick?: () => void
): JSX.Element => {
  let renderComponent = <div />

  if (columnType === 'quantityForId') {
    const quantityData = cellData as {
      quantity: number
      cardId: string
      deckLimit: number
      onQuantityChange: (newQuantity: number) => void
    }
    renderComponent = (
      <CardQuantitySelector
        deckLimit={quantityData.deckLimit}
        quantity={quantityData.quantity}
        onQuantityChange={quantityData.onQuantityChange}
      />
    )
  }
  if (columnType === 'nameFactionType') {
    const nameData = cellData as {
      name: string
      faction: string
      type: string
      cardId: string
      format: string
    }
    renderComponent = <CardLink cardId={nameData.cardId} format={nameData.format} />
  }
  if (columnType === 'traits') {
    const traitsData = cellData as {
      traits: string
    }
    renderComponent = (
      <span style={{ fontSize: 12 }}>
        <i>{traitsData.traits}</i>
      </span>
    )
  }
  if (columnType === 'influenceAndFaction') {
    const influenceData = cellData as {
      influence: number
      faction: string
    }
    renderComponent = (
      <div style={{ textAlign: 'right', width: '100%', paddingRight: '10px' }}>
        <InfluenceElement faction={influenceData.faction} influence={influenceData.influence} />
      </div>
    )
  }
  if (columnType === 'cost') {
    const costData = cellData as {
      cost: string
    }
    renderComponent = <div style={{ textAlign: 'center', width: '100%' }}>{costData.cost}</div>
  }
  if (columnType === 'mil') {
    const milData = cellData as {
      mil: string
    }
    renderComponent = <span>{milData.mil}</span>
  }
  if (columnType === 'pol') {
    const polData = cellData as {
      pol: string
    }
    renderComponent = <span>{polData.pol}</span>
  }
  if (columnType === 'glory') {
    const gloryData = cellData as {
      glory: string
    }
    renderComponent = <span>{gloryData.glory}</span>
  }
  if (columnType === 'strength') {
    const strengthData = cellData as {
      strength: string
    }
    renderComponent = <span>{strengthData.strength}</span>
  }

  return (
    <TableCell
      component="div"
      width={width}
      className={clsx(classes.tableCell, classes.flexContainer, {
        [classes.noClick]: onRowClick == null,
      })}
      variant="body"
      style={{
        height: rowHeight,
        ...(width > 0 ? { flexGrow: 0, flexShrink: 0, width: `${width}px` } : { flex: 1 }),
      }}
    >
      {renderComponent}
    </TableCell>
  )
}

export const VirtualizedCardTable: React.FC<MuiVirtualizedTableProps> = ({
  columns,
  headerHeight = 40,
  onRowClick,
  rowCount,
  rowGetter,
  rowHeight = 40,
}) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <StyledContainer ref={parentRef}>
      {/* Header */}
      <div className={classes.header} style={{ height: headerHeight }}>
        {columns.map((column) => (
          <TableCell
            key={column.columnType}
            component="div"
            className={clsx(classes.flexContainer, classes.tableCell, classes.noClick)}
            variant="head"
            width={column.width}
            style={{
              height: headerHeight,
              ...(column.width > 0
                ? { flexGrow: 0, flexShrink: 0, width: `${column.width}px` }
                : { flex: 1 }),
            }}
          >
            <span>{column.label}</span>
          </TableCell>
        ))}
      </div>

      {/* Virtual rows */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowData = rowGetter({ index: virtualRow.index })

          return (
            <div
              key={virtualRow.key}
              className={clsx(classes.tableRow, classes.flexContainer, {
                [classes.tableRowHover]: onRowClick != null,
              })}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={onRowClick}
            >
              {columns.map((column) => {
                const cellData = rowData[column.columnType as keyof TableCardData]
                return (
                  <React.Fragment key={column.columnType}>
                    {cellRenderer(cellData, column.columnType, column.width, rowHeight, onRowClick)}
                  </React.Fragment>
                )
              })}
            </div>
          )
        })}
      </div>
    </StyledContainer>
  )
}

export interface TableCardData {
  quantityForId: {
    quantity: number
    deckLimit: number
    onQuantityChange: (newQuantity: number) => void
  }
  nameFactionType: {
    name: string
    faction: string
    type: string
    cardId: string
    format: string
  }
  traits?: {
    traits: string
  }
  influenceAndFaction: {
    influence: number
    faction: string
  }
  cost: {
    cost: string
  }
  mil?: {
    mil: string
  }
  pol?: {
    pol: string
  }
  glory?: {
    glory: string
  }
  strength?: {
    strength: string
  }
}
