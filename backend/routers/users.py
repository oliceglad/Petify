from auth import fastapi_users
from schemas import UserRead, UserUpdate

router = fastapi_users.get_users_router(
    UserRead,
    UserUpdate,
)
