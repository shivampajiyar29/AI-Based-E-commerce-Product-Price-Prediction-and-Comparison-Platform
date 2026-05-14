from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/pricesense"
    SECRET_KEY: str = "changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SCRAPER_DELAY_SECONDS: int = 2
    ML_MODEL_PATH: str = "app/ml/saved_models/"

    class Config:
        env_file = ".env"

settings = Settings()
