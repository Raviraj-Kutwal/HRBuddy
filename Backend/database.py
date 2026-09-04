from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
try:
    from config_secret import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
    db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
except ImportError:
    # Safe placeholder fallback when deployed or cloned without local secret file
    db_url = "postgresql://postgres:password@localhost:5432/HR_Assistant"

engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)