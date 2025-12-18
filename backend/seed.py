import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import (
    User,
    Pet,
    Preference,
    Habit,
    HealthRecord,
    Event,
    Clinic,
)
from security import pwd_context


async def seed_test_data(session: AsyncSession) -> None:
    # Проверяем, есть ли пользователи
    result = await session.execute(select(User))
    if result.scalars().first():
        return  # данные уже есть, ничего не делаем

    # ------------------------
    # Пользователь
    # ------------------------
    user = User(
        id=uuid.uuid4(),
        email="test@petify.dev",
        hashed_password=pwd_context.hash("Test12345"),
        is_active=True,
        is_superuser=False,
        is_verified=True,
    )
    session.add(user)
    await session.flush()

    # ------------------------
    # Питомцы
    # ------------------------
    pet1 = Pet(
        user_id=user.id,
        name="Барсик",
        species="Кот",
        breed="Британец",
        birth_date="2021-05-12",
        notes="Любит спать на клавиатуре",
    )

    pet2 = Pet(
        user_id=user.id,
        name="Рекс",
        species="Собака",
        breed="Лабрадор",
        birth_date="2020-03-01",
        notes="Очень активный",
    )

    session.add_all([pet1, pet2])
    await session.flush()

    # ------------------------
    # Предпочтения
    # ------------------------
    session.add_all(
        [
            Preference(
                pet_id=pet1.id,
                likes="Рыба, коробки",
                dislikes="Пылесос",
            ),
            Preference(
                pet_id=pet2.id,
                likes="Мячи, прогулки",
                dislikes="Громкие звуки",
            ),
        ]
    )

    # ------------------------
    # Привычки
    # ------------------------
    session.add_all(
        [
            Habit(pet_id=pet1.id, title="Спит днём"),
            Habit(pet_id=pet2.id, title="Просится гулять утром"),
        ]
    )

    # ------------------------
    # Медицинские записи
    # ------------------------
    session.add(
        HealthRecord(
            pet_id=pet1.id,
            title="Вакцинация",
            details="Комплексная вакцина",
            created_at=datetime.utcnow(),
        )
    )

    # ------------------------
    # События календаря
    # ------------------------
    session.add_all(
        [
            Event(
                pet_id=pet1.id,
                title="Кормление",
                type="feeding",
                start_at=(datetime.utcnow() + timedelta(hours=1)).isoformat(),
                status="planned",
            ),
            Event(
                pet_id=pet2.id,
                title="Прогулка",
                type="walk",
                start_at=(datetime.utcnow() + timedelta(hours=2)).isoformat(),
                status="planned",
            ),
        ]
    )

    # ------------------------
    # Клиники
    # ------------------------
    session.add_all(
        [
            Clinic(
                name="ВетМир",
                address="ул. Ленина, 10",
                lat=53.1959,
                lng=50.1002,
            ),
            Clinic(
                name="Айболит",
                address="пр. Кирова, 45",
                lat=53.2121,
                lng=50.1803,
            ),
        ]
    )

    await session.commit()
