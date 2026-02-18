from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
db_url="postgresql://postgres:mysql@localhost:5432/HR_Assistant"
engine=create_engine(db_url)
Session=sessionmaker(autocommit=False,autoflush=False,bind=engine)