import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Box, Typography } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | undefined
}

// React catches render errors only in a class component with these two methods
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: undefined }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('A page failed to render', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Something went wrong on this page
          </Typography>
          <Typography>{this.state.error.message}</Typography>
        </Box>
      )
    }
    return this.props.children
  }
}

/**
 * Shows an error message instead of a blank app when a page fails to render. The header
 * stays usable, and going to another page starts over.
 */
export function PageErrorBoundary(props: Props): JSX.Element {
  const location = useLocation()
  return <ErrorBoundary key={location.pathname}>{props.children}</ErrorBoundary>
}
