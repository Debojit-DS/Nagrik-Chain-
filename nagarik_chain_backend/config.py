import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field("sqlite:///./nagarik_chain.db", description="Database connection URL")
    JWT_SECRET: str = Field("nagarik_chain_super_secret_key_2026_india", description="Secret key for JWT generation")
    JWT_ALGORITHM: str = Field("HS256", description="Algorithm for token signing")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Storage settings
    IPFS_MOCK_CACHE_DIR: str = "./.ipfs_cache"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
