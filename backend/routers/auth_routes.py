from fastapi_users import FastAPIUsers
from auth import auth_backend, fastapi_users
from schemas import UserRead, UserCreate

router = fastapi_users.get_register_router(
    UserRead,
    UserCreate,
)

login_router = fastapi_users.get_auth_router(
    auth_backend,
)
