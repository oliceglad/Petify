from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import Habit, Pet
from schemas import HabitCreate, HabitRead
from auth import current_user

router = APIRouter(tags=["Habits"])


@router.get("/pets/{pet_id}/habits", response_model=list[HabitRead])
async def list_habits(
    pet_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    result = await session.execute(
        select(Habit).where(Habit.pet_id == pet_id)
    )
    return result.scalars().all()


@router.post("/pets/{pet_id}/habits", response_model=HabitRead)
async def create_habit(
    pet_id: str,
    data: HabitCreate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    habit = Habit(pet_id=pet_id, **data.model_dump())
    session.add(habit)
    await session.commit()
    await session.refresh(habit)
    return habit


@router.delete("/habits/{habit_id}")
async def delete_habit(
    habit_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    habit = await session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    pet = await session.get(Pet, habit.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await session.delete(habit)
    await session.commit()
    return {"status": "deleted"}
