from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Clip(Base):
    __tablename__ = "clips"
    id = Column(Integer, primary_key=True)
    kind = Column(String(16), default="note")  # "note" or "bookmark"
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    url = Column(String(1000), nullable=True)
    tags = Column(String(300), default="")     # comma-separated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
