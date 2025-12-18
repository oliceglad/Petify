import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  useAddPetMutation,
  useListEventsQuery,
  useListPetsQuery,
} from '../services/api.js'

const initialPet = {
  name: '',
  species: '',
  breed: '',
  birth_date: '',
  notes: '',
}

const DashboardPage = () => {
  const { data: pets = [], isLoading } = useListPetsQuery()
  const { data: events = [] } = useListEventsQuery()
  const [addPet, { isLoading: creatingPet }] = useAddPetMutation()
  const [petForm, setPetForm] = useState(initialPet)

  const upcomingEvents = useMemo(() => {
    const now = dayjs()
    return events
      .filter((event) => dayjs(event.start_at).isAfter(now.subtract(1, 'day')))
      .sort((a, b) => dayjs(a.start_at).unix() - dayjs(b.start_at).unix())
      .slice(0, 4)
  }, [events])

  const handleAddPet = async (e) => {
    e.preventDefault()
    await addPet(petForm).unwrap()
    setPetForm(initialPet)
  }

  return (
    <div className="stack">
      <div className="hero">
        <div>
          <p className="eyebrow">Панель</p>
          <h2>Карточки питомцев и события по расписанию</h2>
          <p className="muted">
            Собрали всё важное: профили, привычки, медкарта, ближайшие задачи и
            контакты клиник.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="muted">Питомцев</span>
            <strong>{pets.length}</strong>
          </div>
          <div className="stat">
            <span className="muted">События сегодня</span>
            <strong>
              {
                events.filter((e) => dayjs(e.start_at).isSame(dayjs(), 'day'))
                  .length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="grid two">
        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Питомцы</p>
              <h3>Ваши хвостики</h3>
            </div>
            <span className="pill muted">
              {isLoading ? 'Загрузка...' : `${pets.length} всего`}
            </span>
          </div>
          <div className="card-grid">
            {pets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`} className="pet-card">
                <div className="pet-icon">{pet.name.charAt(0)}</div>
                <div>
                  <h4>{pet.name}</h4>
                  <p className="muted">
                    {pet.species} · {pet.breed || 'порода не указана'}
                  </p>
                  <p className="badge">Создано: {pet.created_at?.slice(0, 10)}</p>
                  {pet.notes && <p className="muted">{pet.notes}</p>}
                </div>
              </Link>
            ))}
            {pets.length === 0 && (
              <p className="muted">Добавьте первого питомца — это займёт минуту.</p>
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Новый питомец</p>
              <h3>Карточка за 30 секунд</h3>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAddPet}>
            <label className="field">
              <span>Имя</span>
              <input
                required
                value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Вид</span>
              <input
                required
                placeholder="Кот, собака, попугай..."
                value={petForm.species}
                onChange={(e) =>
                  setPetForm({ ...petForm, species: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Порода</span>
              <input
                value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Дата рождения</span>
              <input
                type="date"
                value={petForm.birth_date}
                onChange={(e) =>
                  setPetForm({ ...petForm, birth_date: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Заметки</span>
              <textarea
                rows={3}
                value={petForm.notes}
                onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
              />
            </label>
            <button className="btn" type="submit" disabled={creatingPet}>
              {creatingPet ? 'Сохраняем...' : 'Добавить питомца'}
            </button>
          </form>
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Календарь</p>
            <h3>Ближайшие события</h3>
          </div>
          <Link className="btn ghost" to="/events">
            Все события
          </Link>
        </div>
        <div className="timeline">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <p className="muted">{dayjs(event.start_at).format('DD MMM, HH:mm')}</p>
                <strong>{event.title}</strong>
                <p className="badge">{event.type}</p>
                {event.location && <p className="muted">Место: {event.location}</p>}
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="muted">Запланируйте прогулку, кормление или визит к врачу.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
