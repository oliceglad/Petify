import dayjs from 'dayjs'
import {
  useCompleteEventMutation,
  useDeleteEventMutation,
  useListEventsQuery,
  useListPetsQuery,
} from '../services/api.js'

const EventsPage = () => {
  const { data: events = [], isLoading } = useListEventsQuery()
  const { data: pets = [] } = useListPetsQuery()
  const [completeEvent] = useCompleteEventMutation()
  const [deleteEvent] = useDeleteEventMutation()

  const petNames = Object.fromEntries(pets.map((pet) => [pet.id, pet.name]))

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Календарь</p>
          <h2>Все события</h2>
          <p className="muted">
            Кормления, прогулки, напоминания и посещения клиники в одном списке.
          </p>
        </div>
        <span className="pill muted">{events.length} событий</span>
      </div>

      <div className="timeline">
        {isLoading && <p className="muted">Загружаем расписание...</p>}
        {events
          .slice()
          .sort(
            (a, b) =>
              dayjs(a.start_at).unix() - dayjs(b.start_at).unix(),
          )
          .map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <p className="muted">
                  {dayjs(event.start_at).format('DD MMM, HH:mm')}
                </p>
                <div className="timeline-row">
                  <strong>{event.title}</strong>
                  <span className="badge">{event.type}</span>
                  <span className={`status ${event.status}`}>
                    {event.status}
                  </span>
                </div>
                <p className="muted">
                  Питомец: {petNames[event.pet_id] || 'неизвестно'}
                </p>
                {event.location && (
                  <p className="muted">Место: {event.location}</p>
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
            </div>
          ))}
        {events.length === 0 && (
          <p className="muted">Добавьте первое событие из карточки питомца.</p>
        )}
      </div>
    </div>
  )
}

export default EventsPage
