import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import enum

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./campus_erp.db")

# Connection pooling optimized for high traffic
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TicketCategory(str, enum.Enum):
    CAMPUS = "Campus"
    ACADEMIC = "Academic"
    HOSTEL = "Hostel"
    MESS = "Mess"
    SECURITY = "Security"

class TicketStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    ESCALATED = "Escalated"

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hostel_room = Column(String(50), nullable=True)

class IssueTicket(Base):
    __tablename__ = "issue_tickets"
    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), nullable=False)
    category = Column(Enum(TicketCategory), nullable=False)
    sub_category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    image_path = Column(String(255), nullable=True)
    status = Column(Enum(TicketStatus), default=TicketStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    sla_deadline = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

class NoDuesClearance(Base):
    __tablename__ = "no_dues_clearance"
    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), unique=True, nullable=False)
    library_approved = Column(Boolean, default=False)
    lab_approved = Column(Boolean, default=False)
    accounts_approved = Column(Boolean, default=False)
    hostel_approved = Column(Boolean, default=False)
    dept_head_approved = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FeePayment(Base):
    __tablename__ = "fee_payments"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), unique=True, nullable=False)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), nullable=False)
    amount = Column(Float, nullable=False)
    fee_type = Column(String(50), nullable=False)
    payment_status = Column(String(20), default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.utcnow)

class MessFeedback(Base):
    __tablename__ = "mess_feedback"
    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    photo_path = Column(String(255), nullable=True)
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MessMenuVote(Base):
    __tablename__ = "mess_menu_votes"
    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), nullable=False)
    option_name = Column(String(100), nullable=False)
    vote_month = Column(String(7), nullable=False) # e.g., "2026-10"

class GatePass(Base):
    __tablename__ = "gate_passes"
    id = Column(Integer, primary_key=True, index=True)
    pass_id = Column(String(50), unique=True, nullable=False)
    roll_no = Column(String(20), ForeignKey("students.roll_no"), nullable=False)
    reason = Column(String(255), nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()