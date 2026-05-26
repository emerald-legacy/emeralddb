import { type JSX } from 'react'
import { Grid, Paper, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'

interface StatisticChartCardProps {
  title: string
  averageValue: number
  data: { value: string | number; count: number }[]
  dataKey: 'value'
  color: string
  noDataMessage: string
}

export function StatisticChartCard({
  title,
  averageValue,
  data,
  dataKey,
  color,
  noDataMessage,
}: StatisticChartCardProps): JSX.Element {
  return (
    <Grid size={{ xs: 12, sm: 6 }} component="div">
      <Paper elevation={2} sx={{ p: 1 }}>
        <Typography variant="h6" align="center">
          {title} <br /> <span style={{ fontSize: '70%' }}>(Avg: {averageValue.toFixed(2)})</span>
        </Typography>
        {data.length > 0 ? (
          <BarChart
            xAxis={[{ scaleType: 'band', data: data.map((d) => d[dataKey]), hideTooltip: true }]}
            series={[
              {
                data: data.map((d) => d.count),
                valueFormatter: (value) => `${value}`,
                color: color,
              },
            ]}
            height={160}
            slots={{ legend: () => null }}
            slotProps={{
              tooltip: {
                sx: {
                  '& .MuiChartsTooltip-paper': {
                    margin: 0,
                    padding: 0,
                    '& > *': {
                      margin: 0,
                      padding: 0,
                      lineHeight: 1,
                    },
                  },
                  '& .MuiChartsTooltip-valueCell': {
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  },
                  '& .MuiChartsTooltip-labelCell': {
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                  },
                },
              },
            }}
            margin={{ left: 0, bottom: 0 }}
          />
        ) : (
          <Typography align="center" color="text.secondary">
            {noDataMessage}
          </Typography>
        )}
      </Paper>
    </Grid>
  )
}
