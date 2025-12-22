from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Petify API"

    database_url: str
    jwt_secret: str = "super_secret_key_change_me"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://45.8.250.54:5173",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
