import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  StyledEngineProvider,
} from '@mui/material/styles'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeaderBar } from './components/HeaderBar'
import { Auth0ProviderWithHistory } from './providers/Auth0ProviderWithHistory'
import { UiStoreProvider } from './providers/UiStoreProvider'
import { Container, Grid, Toolbar, useMediaQuery } from '@mui/material'
import { UserProvider } from './providers/UserProvider'
import { ConfirmProvider } from 'material-ui-confirm'
import { Routes } from './Routes'
import { PageErrorBoundary } from './components/PageErrorBoundary'
import { SnackbarProvider } from 'notistack'

import type { JSX } from 'react'

// create our material ui theme using up to date typography variables
let theme = createTheme({
  palette: {
    primary: {
      main: '#212121',
    },
    secondary: {
      main: '#1b5e20',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '0px',
          paddingRight: '0px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: '8px',
          paddingRight: '8px',
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)

const FIVE_MINUTES = 5 * 60 * 1000
const TEN_MINUTES = 10 * 60 * 1000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES, // data stays fresh this long
      gcTime: TEN_MINUTES, // unused data stays in the cache this long
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
})

export default function App(): JSX.Element {
  const is1440PxOrBigger = useMediaQuery('(min-width:1440px)')

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Auth0ProviderWithHistory>
              <UiStoreProvider>
                <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
                  <ConfirmProvider
                    defaultOptions={{
                      dialogProps: {
                        maxWidth: 'md',
                      },
                    }}
                  >
                    <UserProvider>
                      <HeaderBar />
                      <Toolbar variant="dense" />
                      <Container maxWidth={false} style={{ paddingTop: 15 }}>
                        <Grid
                          container
                          sx={{
                            justifyContent: 'center',
                          }}
                        >
                          <Grid size={{ xs: 12, md: 12, lg: is1440PxOrBigger ? 10 : 12, xl: 10 }}>
                            <PageErrorBoundary>
                              <Routes />
                            </PageErrorBoundary>
                          </Grid>
                        </Grid>
                      </Container>
                    </UserProvider>
                  </ConfirmProvider>
                </SnackbarProvider>
              </UiStoreProvider>
            </Auth0ProviderWithHistory>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
