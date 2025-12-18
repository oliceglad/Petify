import { useEffect } from 'react'
import {
  Navigate,
  Route,
  Routes,
  Link,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PetDetailsPage from './pages/PetDetailsPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import ClinicsPage from './pages/ClinicsPage.jsx'
import { logout, setUser } from './features/auth/authSlice.js'
import { useCurrentUserQuery } from './services/api.js'

const ProtectedLayout = () => {
  const token = useSelector((state) => state.auth.token)
  const location = useLocation()
  const dispatch = useDispatch()

  const { data: user, isFetching } = useCurrentUserQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (user) {
      dispatch(setUser(user))
    }
  }, [user, dispatch])

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <ShellLayout userLoading={isFetching}>
      <Outlet />
    </ShellLayout>
  )
}

const ShellLayout = ({ userLoading, children }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const navItems = [
    { to: '/', label: 'Питомцы' },
    { to: '/events', label: 'События' },
    { to: '/clinics', label: 'Клиники' },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Pf</div>
          <div>
            <p className="eyebrow">Petify</p>
            <p className="muted">Домашние любимцы под контролем</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Демо доступ</p>
          <p className="muted">email: test@petify.dev</p>
          <p className="muted">pass: Test12345</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Центр управления</p>
            <h1>Petify</h1>
          </div>
          <div className="user-pill">
            <div>
              <p className="muted">Аккаунт</p>
              <strong>{userLoading ? 'Синхронизация...' : user?.email}</strong>
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => dispatch(logout())}
            >
              Выйти
            </button>
          </div>
        </header>

        <section className="page-body">
          {children || <Outlet />}
        </section>
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pets/:petId" element={<PetDetailsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/clinics" element={<ClinicsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
