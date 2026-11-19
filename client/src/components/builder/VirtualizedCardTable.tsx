import React, { useRef, type JSX } from 'react'
import { styled } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CardQuantitySelector } from './CardQuantitySelector'
import { CardLink } from '../card/CardLink'
import { InfluenceElement } from '../card/InfluenceElement'

const PREFIX = 'VirtualizedCardTable'

function classNames(...names: (string | false)[]): string {
  return names.filter(Boolean).join(' ')
}

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
  columnType: keyof TableCardData
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

// The cell content for one column, read from the row's field of the same name
function cellContent(row: TableCardData, columnType: keyof TableCardData): JSX.Element {
  switch (columnType) {
    case 'quantityForId':
      return (
        <CardQuantitySelector
          deckLimit={row.quantityForId.deckLimit}
          quantity={row.quantityForId.quantity}
          onQuantityChange={row.quantityForId.onQuantityChange}
        />
      )
    case 'nameFactionType':
      return <CardLink cardId={row.nameFactionType.cardId} format={row.nameFactionType.format} />
    case 'traits':
      return (
        <span style={{ fontSize: 12 }}>
          <i>{row.traits?.traits}</i>
        </span>
      )
    case 'influenceAndFaction':
      return (
        <div style={{ textAlign: 'right', width: '100%', paddingRight: '10px' }}>
          <InfluenceElement
            faction={row.influenceAndFaction.faction}
            influence={row.influenceAndFaction.influence}
          />
        </div>
      )
    case 'cost':
      return <div style={{ textAlign: 'center', width: '100%' }}>{row.cost.cost}</div>
    case 'mil':
      return <span>{row.mil?.mil}</span>
    case 'pol':
      return <span>{row.pol?.pol}</span>
    case 'glory':
      return <span>{row.glory?.glory}</span>
    case 'strength':
      return <span>{row.strength?.strength}</span>
  }
}

const cellRenderer = (
  row: TableCardData,
  columnType: keyof TableCardData,
  width: number,
  rowHeight: number,
  onRowClick?: () => void
): JSX.Element => {
  const renderComponent = cellContent(row, columnType)

  return (
    <TableCell
      component="div"
      width={width}
      className={classNames(
        classes.tableCell,
        classes.flexContainer,
        onRowClick == null && classes.noClick
      )}
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
            className={classNames(classes.flexContainer, classes.tableCell, classes.noClick)}
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
              className={classNames(
                classes.tableRow,
                classes.flexContainer,
                onRowClick != null && classes.tableRowHover
              )}
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
                return (
                  <React.Fragment key={column.columnType}>
                    {cellRenderer(rowData, column.columnType, column.width, rowHeight, onRowClick)}
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
