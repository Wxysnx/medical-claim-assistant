from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# 创建数据库连接
SQLALCHEMY_DATABASE_URL = "sqlite:///./claims.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(100))
    service_date = Column(DateTime)
    cpt_code = Column(String(20))
    icd10_codes = Column(String(100))  # 存储为逗号分隔的字符串
    denial_reason = Column(String(200))
    insurance_company = Column(String(100))
    claim_amount = Column(Float)
    additional_info = Column(Text)
    
    # 上诉相关字段
    appeal_text = Column(Text)  # 存储生成的上诉信
    appeal_status = Column(String(50))  # 例如：'pending', 'submitted', 'successful', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 创建数据库表
def init_db():
    Base.metadata.create_all(bind=engine)

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()