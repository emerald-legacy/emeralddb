import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router'
import { useCurrentUser } from './providers/UserProvider'
import { lazy, Suspense, useEffect, type JSX } from 'react';
import { Loading } from './components/Loading'

// Lazy load all route components for code splitting
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })))
const BuilderView = lazy(() => import('./views/BuilderView').then(m => ({ default: m.BuilderView })))
const CardDetailView = lazy(() => import('./views/CardDetailView').then(m => ({ default: m.CardDetailView })))
const CardsView = lazy(() => import('./views/CardsView').then(m => ({ default: m.CardsView })))
const CreateCardView = lazy(() => import('./views/CreateCardView').then(m => ({ default: m.CreateCardView })))
const CreateDeckView = lazy(() => import('./views/CreateDeckView').then(m => ({ default: m.CreateDeckView })))
const DeckDetailView = lazy(() => import('./views/DeckDetailView').then(m => ({ default: m.DeckDetailView })))
const DecksView = lazy(() => import('./views/DecksView').then(m => ({ default: m.DecksView })))
const EditCardView = lazy(() => import('./views/EditCardView').then(m => ({ default: m.EditCardView })))
const EditDeckView = lazy(() => import('./views/EditDeckView').then(m => ({ default: m.EditDeckView })))
const EditPackCardsView = lazy(() => import('./views/EditPackCardsView').then(m => ({ default: m.EditPackCardsView })))
const EditPackView = lazy(() => import('./views/EditPackView').then(m => ({ default: m.EditPackView })))
const ManageCyclesView = lazy(() => import('./views/ManageCyclesView').then(m => ({ default: m.ManageCyclesView })))
const NotLoggedIn = lazy(() => import('./views/NotLoggedIn').then(m => ({ default: m.NotLoggedIn })))
const NotPermitted = lazy(() => import('./views/NotPermitted').then(m => ({ default: m.NotPermitted })))
const FFGRulesReferenceGuide = lazy(() => import('./views/FFGRulesReferenceGuide').then(m => ({ default: m.FFGRulesReferenceGuide })))
const OpLists = lazy(() => import('./views/OpLists').then(m => ({ default: m.OpLists })))
const HelpView = lazy(() => import('./views/HelpView').then(m => ({ default: m.HelpView })))
const EditTraitsView = lazy(() => import('./views/EditTraitsView').then(m => ({ default: m.EditTraitsView })))
const EditFormatsView = lazy(() => import('./views/EditFormatsView').then(m => ({ default: m.EditFormatsView })))
const ELRulesReferenceGuideNew = lazy(() => import('./views/ELRulesReferenceGuideNew').then(m => ({ default: m.ELRulesReferenceGuideNew })))
const StartPage = lazy(() => import('./views/StartPage'))

const AuthenticatedRoute = (props: { children: JSX.Element }) => {
  const { isLoggedIn } = useCurrentUser()
  return isLoggedIn() ? props.children : <NotLoggedIn />
}

const DataAdminRoute = (props: { children: JSX.Element }) => {
  const { isDataAdmin } = useCurrentUser()
  return isDataAdmin() ? props.children : <NotPermitted />
}

export function Routes(): JSX.Element {
  const location = useLocation()
  useEffect(() => {
    const host = window.location.host
    const prefix = host.includes('localhost') ? 'LOCAL' : host.includes('beta-') ? 'BETA' : ''
    const title = `${prefix} EmeraldDB`
    document.title = title
  }, [location])
  return (
    <Suspense fallback={<Loading />}>
      <RouterRoutes>
        <Route path="/cards" element={<CardsView />} />
        <Route path="/rules/imperial" element={<FFGRulesReferenceGuide />} />
        <Route path="/rules/emerald" element={<ELRulesReferenceGuideNew />} />
        <Route path="/rules/organized-play/:format" element={<OpLists />} />
        <Route path="/rules/organized-play" element={<OpLists />} />
        <Route path="/rules" element={<Navigate to="/rules/emerald" replace />} />
        <Route path="/faq" element={<HelpView />} />
        <Route path="/decks/:id" element={<DeckDetailView />} />
        <Route path="/decks" element={<DecksView />} />
        <Route path="/builder/create/new" element={<AuthenticatedRoute><CreateDeckView /></AuthenticatedRoute>} />
        <Route path="/builder/:id/edit" element={<AuthenticatedRoute><EditDeckView /></AuthenticatedRoute>} />
        <Route path="/builder" element={<AuthenticatedRoute><BuilderView /></AuthenticatedRoute>} />
        <Route path="/card/:id/edit" element={<DataAdminRoute><EditCardView /></DataAdminRoute>} />
        <Route path="/card/create/new" element={<DataAdminRoute><CreateCardView /></DataAdminRoute>} />
        <Route path="/admin/pack/:id/cards" element={<DataAdminRoute><EditPackCardsView /></DataAdminRoute>} />
        <Route path="/admin/pack/:id/edit" element={<DataAdminRoute><EditPackView /></DataAdminRoute>} />
        <Route path="/admin/cycles" element={<DataAdminRoute><ManageCyclesView /></DataAdminRoute>} />
        <Route path="/admin/traits" element={<DataAdminRoute><EditTraitsView /></DataAdminRoute>} />
        <Route path="/admin/formats" element={<DataAdminRoute><EditFormatsView /></DataAdminRoute>} />
        <Route path="/admin" element={<DataAdminRoute><AdminView /></DataAdminRoute>} />
        <Route path="/card/:id" element={<CardDetailView />} />
        <Route path="/" element={<StartPage />} />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </RouterRoutes>
    </Suspense>
  )
}
