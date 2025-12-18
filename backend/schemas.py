from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr
from fastapi_users import schemas as fa_schemas


# ======================================================
# Пользователь (fastapi-users)
# ======================================================

class UserRead(fa_schemas.BaseUser[UUID]):
    created_at: datetime | None = None


from pydantic import Field
from fastapi_users import schemas as fa_schemas


class UserCreate(fa_schemas.BaseUserCreate):
    password: str = Field(
        min_length=8,
        max_length=64,
        description="Password must be between 8 and 64 characters",
    )



class UserUpdate(fa_schemas.BaseUserUpdate):
    full_name: str | None = None


# ======================================================
# Питомцы
# ======================================================

class PetBase(BaseModel):
    name: str
    species: str
    breed: str | None = None
    birth_date: str | None = None
    notes: str | None = None


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    name: str | None = None
    species: str | None = None
    breed: str | None = None
    birth_date: str | None = None
    notes: str | None = None


class PetRead(PetBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# Предпочтения питомца
# ======================================================

class PreferenceBase(BaseModel):
    likes: str | None = None
    dislikes: str | None = None
    food_notes: str | None = None


class PreferenceUpdate(PreferenceBase):
    pass


class PreferenceRead(PreferenceBase):
    id: str
    pet_id: str

    class Config:
        from_attributes = True


# ======================================================
# Привычки
# ======================================================

class HabitBase(BaseModel):
    title: str
    description: str | None = None


class HabitCreate(HabitBase):
    pass


class HabitRead(HabitBase):
    id: str
    pet_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# Медицинские записи
# ======================================================

class HealthRecordBase(BaseModel):
    record_type: str
    title: str
    details: str | None = None
    record_date: str | None = None


class HealthRecordCreate(HealthRecordBase):
    pass


class HealthRecordUpdate(BaseModel):
    record_type: str | None = None
    title: str | None = None
    details: str | None = None
    record_date: str | None = None


class HealthRecordRead(HealthRecordBase):
    id: str
    pet_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# События календаря
# ======================================================

class EventBase(BaseModel):
    type: str                 # feeding / walk / vet_visit
    title: str
    start_at: str
    end_at: str | None = None
    location: str | None = None
    notes: str | None = None


class EventCreate(EventBase):
    pet_id: str


class EventUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    start_at: str | None = None
    end_at: str | None = None
    location: str | None = None
    notes: str | None = None
    status: str | None = None


class EventRead(EventBase):
    id: str
    pet_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# Ветеринарные клиники
# ======================================================

class ClinicRead(BaseModel):
    id: str
    name: str
    address: str | None
    phone: str | None
    lat: float | None
    lng: float | None
    source: str | None

    class Config:
        from_attributes = True


class ClinicSearchResponse(BaseModel):
    items: list[ClinicRead]
