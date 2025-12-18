from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import HealthRecord, Pet
from schemas import HealthRecordCreate, HealthRecordUpdate, HealthRecordRead
from auth import current_user

router = APIRouter(tags=["Health Records"])


@router.get("/pets/{pet_id}/health-records", response_model=list[HealthRecordRead])
async def list_records(
    pet_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    result = await session.execute(
        select(HealthRecord).where(HealthRecord.pet_id == pet_id)
    )
    return result.scalars().all()


@router.post("/pets/{pet_id}/health-records", response_model=HealthRecordRead)
async def create_record(
    pet_id: str,
    data: HealthRecordCreate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    pet = await session.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")

    record = HealthRecord(pet_id=pet_id, **data.model_dump())
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record


@router.put("/health-records/{record_id}", response_model=HealthRecordRead)
async def update_record(
    record_id: str,
    data: HealthRecordUpdate,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    record = await session.get(HealthRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    pet = await session.get(Pet, record.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)

    await session.commit()
    await session.refresh(record)
    return record


@router.delete("/health-records/{record_id}")
async def delete_record(
    record_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    record = await session.get(HealthRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    pet = await session.get(Pet, record.pet_id)
    if pet.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await session.delete(record)
    await session.commit()
    return {"status": "deleted"}
