from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import Event, Pet
from schemas import EventCreate, EventUpdate, EventRead
from auth import current_user

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=list[EventRead])
async def list_events(
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    result = await session.execute(
        select(Event).join(Pet).where(Pet.user_id == user.id)
    )
    return result.scalars().all()


@router.post("", response_model=EventRead)
async def create_event(
    data: EventCreate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, data.pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    event = Event(**data.model_dump())
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
async def get_event(
    event_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    pet = await session.get(Pet, event.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return event


@router.put("/{event_id}", response_model=EventRead)
async def update_event(
    event_id: str,
    data: EventUpdate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    pet = await session.get(Pet, event.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(event, key, value)

    await session.commit()
    await session.refresh(event)
    return event


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    pet = await session.get(Pet, event.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await session.delete(event)
    await session.commit()
    return {"status": "deleted"}


@router.patch("/{event_id}/complete", response_model=EventRead)
async def complete_event(
    event_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    pet = await session.get(Pet, event.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    event.status = "done"
    await session.commit()
    await session.refresh(event)
    return event
