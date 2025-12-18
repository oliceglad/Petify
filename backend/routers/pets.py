from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import Pet
from schemas import PetCreate, PetUpdate, PetRead
from auth import current_user

router = APIRouter(prefix="/pets", tags=["Pets"])


@router.get("", response_model=list[PetRead])
async def list_pets(
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    result = await session.execute(
        select(Pet).where(Pet.user_id == user.id)
    )
    return result.scalars().all()


@router.post("", response_model=PetRead)
async def create_pet(
    data: PetCreate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = Pet(user_id=user.id, **data.model_dump())
    session.add(pet)
    await session.commit()
    await session.refresh(pet)
    return pet


@router.get("/{pet_id}", response_model=PetRead)
async def get_pet(
    pet_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.put("/{pet_id}", response_model=PetRead)
async def update_pet(
    pet_id: str,
    data: PetUpdate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pet, key, value)

    await session.commit()
    await session.refresh(pet)
    return pet


@router.delete("/{pet_id}")
async def delete_pet(
    pet_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    await session.delete(pet)
    await session.commit()
    return {"status": "deleted"}
