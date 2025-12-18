from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth_routes
from config import settings
from db import engine, Base, SessionLocal
from seed import seed_test_data
import asyncio
from sqlalchemy.exc import OperationalError

# auth
from auth import fastapi_users, auth_backend
from schemas import UserRead, UserCreate, UserUpdate

# routers
from routers import (
    users as users_router,
    pets,
    preferences,
    habits,
    health_records,
    events,
    clinics,
)

app = FastAPI(
    title="Petify API",
    description="Web application for managing pets and their schedules",
    version="1.0.0",
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Startup: create tables
# -------------------------

@app.on_event("startup")
async def on_startup():
    retries = 10

    for i in range(retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

            async with SessionLocal() as session:
                await seed_test_data(session)

            print("✅ Database ready and test data seeded")
            break
        except OperationalError:
            print(f"⏳ Waiting for DB ({i + 1}/{retries})")
            await asyncio.sleep(2)
    retries = 10
    delay = 2

    for attempt in range(retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Database connected")
            break
        except OperationalError:
            print(f"⏳ Waiting for DB... ({attempt + 1}/{retries})")
            await asyncio.sleep(delay)
    else:
        raise RuntimeError("❌ Database is not available")



# -------------------------
# Auth (fastapi-users)
# -------------------------
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth",
    tags=["Auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["Auth"],
)

# -------------------------
# Users
# -------------------------
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["Users"],
)

# -------------------------
# Domain routers
# -------------------------
app.include_router(pets.router)
app.include_router(preferences.router)
app.include_router(habits.router)
app.include_router(health_records.router)
app.include_router(events.router)
app.include_router(clinics.router)


# -------------------------
# Root
# -------------------------
@app.get("/")
async def root():
    return {"status": "Petify backend is running"}
