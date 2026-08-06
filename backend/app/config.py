from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: str
    DATABASE_URL: str
    ANTHROPIC_MODEL: str = "claude-sonnet-4-6"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LOG_LEVEL: str = "INFO"
    SIMILARITY_THRESHOLD: float = 0.3
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64


settings = Settings()
