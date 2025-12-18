import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../services/api.js'

const RegisterPage = () => {
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(form).unwrap()
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Petify</p>
        <h2>Регистрация</h2>
        <p className="muted">
          Создайте учетную запись и управляйте питомцами из одного места
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
              minLength={8}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && (
            <div className="error">
              Не удалось зарегистрироваться: {error?.data?.detail || 'ошибка'}
            </div>
          )}
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="muted">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
      {isSuccess && <div className="toast">Готово! Теперь войдите.</div>}
    </div>
  )
}

export default RegisterPage
