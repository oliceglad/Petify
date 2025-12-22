import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  useAddEventMutation,
  useAddHabitMutation,
  useAddHealthRecordMutation,
  useCompleteEventMutation,
  useDeleteEventMutation,
  useDeleteHabitMutation,
  useDeleteHealthRecordMutation,
  useGetPetQuery,
  useGetPreferencesQuery,
  useListEventsQuery,
  useListHabitsQuery,
  useListHealthRecordsQuery,
  useUpdatePreferencesMutation,
} from '../services/api.js'

const emptyPref = { likes: '', dislikes: '', food_notes: '' }

const PetDetailsPage = () => {
  const { petId } = useParams()

  const { data: pet, isLoading, isError } = useGetPetQuery(petId)
  const {
    data: preferences,
    isFetching: prefLoading,
    error: prefError,
  } = useGetPreferencesQuery(petId, {
    skip: !petId,
  })
  const { data: habits = [] } = useListHabitsQuery(petId, {
    skip: !petId,
  })
  const { data: healthRecords = [] } = useListHealthRecordsQuery(petId, {
    skip: !petId,
  })
  const { data: events = [] } = useListEventsQuery()

  const [updatePreferences, { isLoading: savingPrefs }] =
    useUpdatePreferencesMutation()
  const [addHabit, { isLoading: addingHabit }] = useAddHabitMutation()
  const [deleteHabit] = useDeleteHabitMutation()
  const [addHealthRecord, { isLoading: addingHealth }] =
    useAddHealthRecordMutation()
  const [deleteHealthRecord] = useDeleteHealthRecordMutation()
  const [addEvent, { isLoading: addingEvent }] = useAddEventMutation()
  const [completeEvent] = useCompleteEventMutation()
  const [deleteEvent] = useDeleteEventMutation()

  const [prefForm, setPrefForm] = useState(emptyPref)
  const [habitTitle, setHabitTitle] = useState('')
  const [healthForm, setHealthForm] = useState({
    record_type: 'Вакцинация',
    title: '',
    record_date: '',
    details: '',
  })
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'feeding',
    start_at: '',
    end_at: '',
    location: '',
    notes: '',
  })

  useEffect(() => {
    if (preferences) {
      setPrefForm({
        likes: preferences.likes || '',
        dislikes: preferences.dislikes || '',
        food_notes: preferences.food_notes || '',
      })
    } else {
      setPrefForm(emptyPref)
    }
  }, [preferences])

  const petEvents = useMemo(
    () => (events || []).filter((event) => event.pet_id === petId),
    [events, petId],
  )
  const sortedPetEvents = useMemo(
    () =>
      [...petEvents].sort((a, b) =>
        dayjs(a.start_at).isAfter(dayjs(b.start_at)) ? 1 : -1,
      ),
    [petEvents],
  )

  const handlePrefSubmit = async (e) => {
    e.preventDefault()
    await updatePreferences({ petId, ...prefForm }).unwrap()
  }

  const handleHabitCreate = async (e) => {
    e.preventDefault()
    if (!habitTitle.trim()) return
    await addHabit({ petId, title: habitTitle }).unwrap()
    setHabitTitle('')
  }

  const handleHealthCreate = async (e) => {
    e.preventDefault()
    await addHealthRecord({ petId, ...healthForm }).unwrap()
    setHealthForm({
      record_type: 'Вакцинация',
      title: '',
      record_date: '',
      details: '',
    })
  }

  const handleEventCreate = async (e) => {
    e.preventDefault()
    await addEvent({ pet_id: petId, ...eventForm }).unwrap()
    setEventForm({
      title: '',
      type: 'feeding',
      start_at: '',
      end_at: '',
      location: '',
      notes: '',
    })
  }

  if (isLoading) return <p className="muted">Загружаем данные...</p>
  if (isError) return <p className="error">Питомец не найден</p>

  const recordTypeOptions = [
    'Вакцинация',
    'Осмотр',
    'Лаборатория',
    'Лечение',
    'Прививка',
  ]
  const petAvatar = pet?.name?.slice(0, 1)?.toUpperCase() ?? '?'

  return (
    <div className="stack">
      <div className="breadcrumb">
        <Link to="/">Назад к питомцам</Link>
        <span>/</span>
        <strong>{pet?.name}</strong>
      </div>

      <section className="card pet-hero">
        <div className="pet-identity">
          <div className="avatar">{petAvatar}</div>
          <div>
            <p className="eyebrow">Питомец</p>
            <h2>{pet.name}</h2>
            <p className="muted">
              {pet.species} · {pet.breed || 'порода не указана'}
            </p>
          </div>
        </div>
        <div className="hero-stats">
          {pet.birth_date && (
            <span className="chip glow">ДР: {pet.birth_date}</span>
          )}
          <span className="chip subtle">ID: {pet.id}</span>
          <span className="pill muted">
            Создано {dayjs(pet.created_at).format('DD MMM YYYY')}
          </span>
        </div>
        {pet.notes && <p className="muted">{pet.notes}</p>}
        <div className="gradient-line" />
      </section>

      <div className="grid two">
        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Предпочтения</p>
              <h3>Что любит питомец</h3>
            </div>
            {prefLoading && <span className="pill muted">Обновляем...</span>}
          </div>
          {prefError && (
            <p className="muted">
              Предпочтения пока не заданы — добавьте их ниже.
            </p>
          )}
          <form className="form-grid" onSubmit={handlePrefSubmit}>
            <label className="field">
              <span>Любит</span>
              <textarea
                rows={2}
                value={prefForm.likes}
                onChange={(e) =>
                  setPrefForm({ ...prefForm, likes: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Не любит</span>
              <textarea
                rows={2}
                value={prefForm.dislikes}
                onChange={(e) =>
                  setPrefForm({ ...prefForm, dislikes: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Питание</span>
              <textarea
                rows={2}
                value={prefForm.food_notes}
                onChange={(e) =>
                  setPrefForm({ ...prefForm, food_notes: e.target.value })
                }
              />
            </label>
            <button className="btn" type="submit" disabled={savingPrefs}>
              {savingPrefs ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Привычки</p>
              <h3>Поведение и рутины</h3>
            </div>
            <span className="pill muted">{habits.length} привычек</span>
          </div>
          <form className="inline-form" onSubmit={handleHabitCreate}>
            <input
              placeholder="Например: просится гулять утром"
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
            />
            <button className="btn" type="submit" disabled={addingHabit}>
              Добавить
            </button>
          </form>
          <div className="list">
            {habits.map((habit) => (
              <div key={habit.id} className="list-item">
                <div>
                  <strong>{habit.title}</strong>
                  {habit.description && (
                    <p className="muted">{habit.description}</p>
                  )}
                  <p className="badge">
                    Добавлено {dayjs(habit.created_at).format('DD MMM')}
                  </p>
                </div>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => deleteHabit({ habitId: habit.id })}
                >
                  Удалить
                </button>
              </div>
            ))}
            {habits.length === 0 && <p className="muted">Пока без привычек.</p>}
          </div>
        </section>
      </div>

      <div className="grid two">
        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Медкарта</p>
              <h3>История здоровья</h3>
            </div>
            <span className="pill muted">{healthRecords.length} записей</span>
          </div>
          <form className="form-grid" onSubmit={handleHealthCreate}>
            <label className="field">
              <span>Тип записи</span>
              <select
                value={healthForm.record_type}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, record_type: e.target.value })
                }
              >
                {recordTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Заголовок</span>
              <input
                required
                value={healthForm.title}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, title: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Дата</span>
              <input
                type="date"
                value={healthForm.record_date}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, record_date: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Детали</span>
              <textarea
                rows={2}
                value={healthForm.details}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, details: e.target.value })
                }
              />
            </label>
            <button className="btn" type="submit" disabled={addingHealth}>
              {addingHealth ? 'Сохраняем...' : 'Добавить запись'}
            </button>
          </form>
          <div className="timeline">
            {healthRecords.map((record) => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-row">
                    <span className="badge accent">{record.record_type}</span>
                    {record.record_date && (
                      <span className="badge subtle">{record.record_date}</span>
                    )}
                  </div>
                  <strong>{record.title}</strong>
                  {record.details && <p className="muted">{record.details}</p>}
                  <div className="inline-actions">
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() =>
                        deleteHealthRecord({ recordId: record.id, petId })
                      }
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {healthRecords.length === 0 && (
              <p className="muted">Добавьте первую запись медкарты.</p>
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">События</p>
              <h3>Расписание питомца</h3>
            </div>
            <span className="pill muted">{petEvents.length} событий</span>
          </div>
          <form className="form-grid" onSubmit={handleEventCreate}>
            <label className="field">
              <span>Название</span>
              <input
                required
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Тип</span>
              <select
                value={eventForm.type}
                onChange={(e) =>
                  setEventForm({ ...eventForm, type: e.target.value })
                }
              >
                <option value="feeding">Кормление</option>
                <option value="walk">Прогулка</option>
                <option value="vet_visit">Вет-визит</option>
                <option value="reminder">Напоминание</option>
              </select>
            </label>
            <label className="field">
              <span>Начало</span>
              <input
                type="datetime-local"
                value={eventForm.start_at}
                onChange={(e) =>
                  setEventForm({ ...eventForm, start_at: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Окончание</span>
              <input
                type="datetime-local"
                value={eventForm.end_at}
                onChange={(e) =>
                  setEventForm({ ...eventForm, end_at: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Локация</span>
              <input
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Заметки</span>
              <textarea
                rows={2}
                value={eventForm.notes}
                onChange={(e) =>
                  setEventForm({ ...eventForm, notes: e.target.value })
                }
              />
            </label>
            <button className="btn" type="submit" disabled={addingEvent}>
              {addingEvent ? 'Создаём...' : 'Добавить событие'}
            </button>
          </form>
          <div className="list">
            {sortedPetEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-head">
                  <span className="badge accent">{event.type}</span>
                  <span className={`status ${event.status}`}>
                    {event.status}
                  </span>
                </div>
                <strong>{event.title}</strong>
                <p className="muted">
                  {dayjs(event.start_at).format('DD MMM, HH:mm')}
                </p>
                {event.location && (
                  <p className="muted">Локация: {event.location}</p>
                )}
                <div className="inline-actions">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => completeEvent(event.id)}
                  >
                    Завершить
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            {sortedPetEvents.length === 0 && (
              <p className="muted">
                У этого питомца пока нет событий. Запланируйте прогулку или визит.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default PetDetailsPage
