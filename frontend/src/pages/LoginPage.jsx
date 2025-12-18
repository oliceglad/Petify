import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation, useCurrentUserQuery } from '../services/api.js'
import { setCredentials, setUser } from '../features/auth/authSlice.js'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const redirectPath = location.state?.from?.pathname || '/'
  const token = useSelector((state) => state.auth.token)

  const [form, setForm] = useState({
    email: 'test@petify.dev',
    password: 'Test12345',
  })
  const [formError, setFormError] = useState('')

  const [login, { isLoading, error, isSuccess }] = useLoginMutation()
  const {
    data: profile,
    refetch: refetchUser,
    isFetching: loadingUser,
  } = useCurrentUserQuery(undefined, { skip: true })

  useEffect(() => {
    if (token) {
      navigate(redirectPath, { replace: true })
    }
  }, [token, navigate, redirectPath])

  useEffect(() => {
    if (profile) {
      dispatch(setUser(profile))
      navigate(redirectPath, { replace: true })
    }
  }, [profile, dispatch, navigate, redirectPath])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      const auth = await login(form).unwrap()
      dispatch(setCredentials({ token: auth.access_token }))
      const userResponse = await refetchUser()
      if (userResponse.data) {
        dispatch(setUser(userResponse.data))
      }
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setFormError(err?.data?.detail || 'Не удалось войти. Проверьте данные.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Petify</p>
        <h2>Вход в профиль</h2>
        <p className="muted">
          Используйте демо-аккаунт или свои учетные данные
        </p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Пароль</span>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {(error || formError) && (
            <div className="error">
              Ошибка входа: {formError || error?.data?.detail || 'проверьте данные'}
            </div>
          )}
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading || loadingUser ? 'Входим...' : 'Войти'}
          </button>
        </form>
        <p className="muted">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </div>
      {isSuccess && (
        <div className="toast">Успешно! Перенаправляем в рабочую зону.</div>
      )}
    </div>
  )
}

export default LoginPage
