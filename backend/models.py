import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    ForeignKey,
    Boolean,
    DateTime,
    Text,
    Float,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID

from db import Base


# =========================
# Пользователь
# =========================
class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    Пользователь системы Petify.
    Используется fastapi-users.
    """

    __tablename__ = "users"

    # id, email, hashed_password, is_active, is_superuser, is_verified
    # уже определены в SQLAlchemyBaseUserTableUUID

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


# =========================
# Питомец
# =========================
class Pet(Base):
    """
    Профиль домашнего животного.
    """

    __tablename__ = "pets"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), index=True
    )

    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[str] = mapped_column(String(50))  # кот, собака и т.д.
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Связи
    preferences = relationship(
        "Preference",
        back_populates="pet",
        cascade="all, delete-orphan",
        uselist=False,
    )
    habits = relationship(
        "Habit",
        back_populates="pet",
        cascade="all, delete-orphan",
    )
    health_records = relationship(
        "HealthRecord",
        back_populates="pet",
        cascade="all, delete-orphan",
    )
    events = relationship(
        "Event",
        back_populates="pet",
        cascade="all, delete-orphan",
    )


# =========================
# Предпочтения питомца
# =========================
class Preference(Base):
    """
    Что питомец любит / не любит.
    """

    __tablename__ = "preferences"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pet_id: Mapped[str] = mapped_column(
        ForeignKey("pets.id"),
        unique=True,
        index=True,
    )

    likes: Mapped[str | None] = mapped_column(Text, nullable=True)
    dislikes: Mapped[str | None] = mapped_column(Text, nullable=True)
    food_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    pet = relationship("Pet", back_populates="preferences")


# =========================
# Привычки питомца
# =========================
class Habit(Base):
    """
    Привычки и особенности поведения.
    """

    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pet_id: Mapped[str] = mapped_column(
        ForeignKey("pets.id"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    pet = relationship("Pet", back_populates="habits")


# =========================
# Медицинские записи
# =========================
class HealthRecord(Base):
    """
    Медицинская карта питомца.
    """

    __tablename__ = "health_records"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pet_id: Mapped[str] = mapped_column(
        ForeignKey("pets.id"),
        index=True,
    )

    record_type: Mapped[str] = mapped_column(
        String(50)
    )  # вакцинация, осмотр, анализ
    title: Mapped[str] = mapped_column(String(200))
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    record_date: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    pet = relationship("Pet", back_populates="health_records")


# =========================
# События календаря
# =========================
class Event(Base):
    """
    События календаря:
    кормление, прогулка, визит к ветеринару и т.д.
    """

    __tablename__ = "events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pet_id: Mapped[str] = mapped_column(
        ForeignKey("pets.id"),
        index=True,
    )

    type: Mapped[str] = mapped_column(
        String(50)
    )  # feeding, walk, vet_visit, reminder
    title: Mapped[str] = mapped_column(String(200))

    start_at: Mapped[str] = mapped_column(String(30))
    end_at: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )

    location: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        String(20), default="planned"
    )  # planned / done / cancelled

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    pet = relationship("Pet", back_populates="events")


# =========================
# Ветеринарные клиники
# =========================
class Clinic(Base):
    """
    Ветеринарные клиники (кэш поиска).
    """

    __tablename__ = "clinics"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    phone: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )

    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    source: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # nominatim / manual

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
