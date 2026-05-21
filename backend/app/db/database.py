from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Initialize database engine instance
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Automatically checks and revives dead connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency provider loop for endpoints requiring database context
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()