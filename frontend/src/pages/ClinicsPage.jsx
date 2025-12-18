import { useState } from 'react'
import { useSearchClinicsQuery } from '../services/api.js'

const ClinicsPage = () => {
  const [params, setParams] = useState({
    lat: 53.1959,
    lng: 50.1002,
    radius: 5000,
  })

  const { data, isFetching, refetch } = useSearchClinicsQuery(params, {
    skip: !params.lat || !params.lng || !params.radius,
  })

  const clinics = data?.items || []

  const handleSubmit = (e) => {
    e.preventDefault()
    refetch()
  }

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Ветеринарные клиники</p>
          <h2>Поиск поблизости</h2>
          <p className="muted">
            Используйте координаты, чтобы быстро увидеть сохранённые клиники и
            контакты.
          </p>
        </div>
        <span className="pill muted">{clinics.length} найдено</span>
      </div>

      <form className="grid three card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Широта</span>
          <input
            type="number"
            step="0.0001"
            value={params.lat}
            onChange={(e) => setParams({ ...params, lat: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Долгота</span>
          <input
            type="number"
            step="0.0001"
            value={params.lng}
            onChange={(e) => setParams({ ...params, lng: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Радиус, м</span>
          <input
            type="number"
            value={params.radius}
            onChange={(e) => setParams({ ...params, radius: e.target.value })}
          />
        </label>
        <button className="btn full" type="submit" disabled={isFetching}>
          {isFetching ? 'Ищем...' : 'Искать'}
        </button>
      </form>

      <div className="card-grid">
        {clinics.map((clinic) => (
          <div key={clinic.id} className="card">
            <div className="section-header">
              <div>
                <p className="eyebrow">{clinic.source || 'локальная база'}</p>
                <h3>{clinic.name}</h3>
              </div>
              {clinic.phone && <span className="pill">{clinic.phone}</span>}
            </div>
            <p className="muted">{clinic.address || 'Адрес не указан'}</p>
            <div className="chips">
              {clinic.lat && clinic.lng && (
                <span className="chip subtle">
                  {clinic.lat}, {clinic.lng}
                </span>
              )}
            </div>
          </div>
        ))}
        {clinics.length === 0 && (
          <p className="muted">Клиники не найдены для этих координат.</p>
        )}
      </div>
    </div>
  )
}

export default ClinicsPage
