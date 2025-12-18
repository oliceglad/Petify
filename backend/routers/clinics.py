from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db import get_session
from models import Clinic
from schemas import ClinicRead, ClinicSearchResponse
from auth import current_user

router = APIRouter(prefix="/clinics", tags=["Clinics"])


@router.get("/search", response_model=ClinicSearchResponse)
async def search_clinics(
    lat: float,
    lng: float,
    radius: int,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    result = await session.execute(select(Clinic))
    clinics = result.scalars().all()
    return {"items": clinics}


@router.get("/{clinic_id}", response_model=ClinicRead)
async def get_clinic(
    clinic_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(current_user),
):
    clinic = await session.get(Clinic, clinic_id)
    if not clinic:
        return None
    return clinic
