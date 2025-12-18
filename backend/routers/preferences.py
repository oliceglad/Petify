from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import Preference, Pet
from schemas import PreferenceRead, PreferenceUpdate
from auth import current_user

router = APIRouter(prefix="/pets/{pet_id}/preferences", tags=["Preferences"])


@router.get("", response_model=PreferenceRead)
async def get_preferences(
    pet_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    result = await session.execute(
        select(Preference).where(Preference.pet_id == pet_id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        raise HTTPException(status_code=404, detail="Preferences not found")

    return pref


@router.put("", response_model=PreferenceRead)
async def update_preferences(
    pet_id: str,
    data: PreferenceUpdate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    result = await session.execute(
        select(Preference).where(Preference.pet_id == pet_id)
    )
    pref = result.scalar_one_or_none()

    if not pref:
        pref = Preference(pet_id=pet_id)
        session.add(pref)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pref, key, value)

    await session.commit()
    await session.refresh(pref)
    return pref
