import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
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
  const displayClinics = clinics.length
    ? clinics.slice(0, 8)
    : [
        {
          id: 'default-1',
          name: 'ВетМир',
          address: 'ул. Ленина, 10',
          lat: 53.1959,
          lng: 50.1002,
        },
        {
          id: 'default-2',
          name: 'Айболит',
          address: 'пр. Кирова, 45',
          lat: 53.2121,
          lng: 50.1803,
        },
      ]

  const mapCenter = useMemo(
    () => [Number(params.lat) || 53.1959, Number(params.lng) || 50.1002],
    [params.lat, params.lng],
  )
  const mapKey = useMemo(
    () => `${mapCenter[0]}-${mapCenter[1]}-${displayClinics.length}`,
    [mapCenter, displayClinics.length],
  )

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

      <div className="card map-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Карта</p>
            <h3>Рядом с указанной точкой</h3>
          </div>
          <span className="pill muted">Всего: {displayClinics.length}</span>
        </div>
        <div className="map-wrapper">
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="map"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {displayClinics.map(
              (clinic) =>
                clinic.lat &&
                clinic.lng && (
                  <CircleMarker
                    key={clinic.id}
                    center={[clinic.lat, clinic.lng]}
                    radius={10}
                    pathOptions={{
                      color: '#7c3aed',
                      fillColor: '#7c3aed',
                      fillOpacity: 0.6,
                    }}
                  >
                    <Popup>
                      <strong>{clinic.name}</strong>
                      <br />
                      <span className="muted">{clinic.address}</span>
                    </Popup>
                  </CircleMarker>
                ),
            )}
          </MapContainer>
          <div className="map-legend">
            <span className="dot" /> Кликните метку, чтобы увидеть клинику
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicsPage
