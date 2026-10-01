import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from database import (
    init_db, get_db, Student, IssueTicket, NoDuesClearance, FeePayment, 
    MessFeedback, MessMenuVote, GatePass, TicketCategory, TicketStatus
)
from qr_service import generate_gate_pass_qr
from receipt_service import generate_fee_receipt_pdf
from sla_service import calculate_sla_deadline, process_sla_escalations

UPLOAD_DIR = "./static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Campus ERP Portal API", version="2.0.0", lifespan=lifespan)

# Mount static and templates safely
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates") if os.path.exists("templates") else None

# Pydantic Response Schemas for serialization compatibility
class TicketResponseSchema(BaseModel):
    id: int
    roll_no: str
    category: TicketCategory
    sub_category: str
    description: str
    image_path: Optional[str] = None
    status: TicketStatus
    created_at: datetime
    sla_deadline: datetime
    resolution_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

@app.get("/", response_class=HTMLResponse)
def index_page(request: Request):
    if templates:
        return templates.TemplateResponse("index.html", {"request": request})
    return HTMLResponse(content="<h1>Campus ERP Portal Backend API Active</h1>", status_code=200)

# ----------------- SEED STUDENT DATA -----------------
@app.post("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    student = db.query(Student).filter_by(roll_no="2026CS101").first()
    if not student:
        student = Student(roll_no="2026CS101", name="Rahul Sharma", email="rahul@campus.edu", hostel_room="H3-204")
        db.add(student)
        db.flush()
    
    no_dues = db.query(NoDuesClearance).filter_by(roll_no="2026CS101").first()
    if not no_dues:
        no_dues = NoDuesClearance(roll_no="2026CS101")
        db.add(no_dues)

    db.commit()
    return {"message": "Data Seeded Successfully"}

# ----------------- ISSUE TICKETING (24-HR SLA) -----------------
@app.post("/api/tickets/create")
async def create_ticket(
    roll_no: str = Form(...),
    category: TicketCategory = Form(...),
    sub_category: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    saved_path = None
    if file and file.filename:
        file_filename = f"{uuid.uuid4()}_{file.filename}"
        saved_path = os.path.join(UPLOAD_DIR, file_filename)
        content = await file.read()
        with open(saved_path, "wb") as f:
            f.write(content)

    deadline = calculate_sla_deadline(category)
    ticket = IssueTicket(
        roll_no=roll_no,
        category=category,
        sub_category=sub_category,
        description=description,
        image_path=saved_path,
        sla_deadline=deadline
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {
        "message": "Ticket created with 24-hr resolution tracking", 
        "ticket_id": ticket.id, 
        "sla_deadline": ticket.sla_deadline
    }

@app.get("/api/tickets/{roll_no}", response_model=List[TicketResponseSchema])
def get_tickets(roll_no: str, db: Session = Depends(get_db)):
    process_sla_escalations(db)
    tickets = db.query(IssueTicket).filter_by(roll_no=roll_no).all()
    return tickets

# ----------------- DIGITAL NO-DUES CLEARANCE -----------------
@app.get("/api/no-dues/{roll_no}")
def get_no_dues(roll_no: str, db: Session = Depends(get_db)):
    record = db.query(NoDuesClearance).filter_by(roll_no=roll_no).first()
    if not record:
        raise HTTPException(status_code=404, detail="Clearance record not found")
    all_clear = all([
        record.library_approved, record.lab_approved,
        record.accounts_approved, record.hostel_approved, record.dept_head_approved
    ])
    return {
        "clearance": {
            "library_approved": record.library_approved,
            "lab_approved": record.lab_approved,
            "accounts_approved": record.accounts_approved,
            "hostel_approved": record.hostel_approved,
            "dept_head_approved": record.dept_head_approved,
        }, 
        "all_cleared": all_clear
    }

@app.post("/api/no-dues/approve")
def approve_no_dues(roll_no: str = Form(...), dept: str = Form(...), db: Session = Depends(get_db)):
    record = db.query(NoDuesClearance).filter_by(roll_no=roll_no).first()
    if not record:
        raise HTTPException(status_code=404, detail="Clearance record not found")
    
    if dept == "library": record.library_approved = True
    elif dept == "lab": record.lab_approved = True
    elif dept == "accounts": record.accounts_approved = True
    elif dept == "hostel": record.hostel_approved = True
    elif dept == "dept_head": record.dept_head_approved = True
    else: raise HTTPException(status_code=400, detail="Invalid department specified")
    
    db.commit()
    return {"message": f"{dept} clearance granted successfully"}

# ----------------- FEE PAYMENT & RECEIPT -----------------
@app.post("/api/fee/pay")
def pay_fee(roll_no: str = Form(...), amount: float = Form(...), fee_type: str = Form(...), db: Session = Depends(get_db)):
    txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
    payment = FeePayment(transaction_id=txn_id, roll_no=roll_no, amount=amount, fee_type=fee_type)
    db.add(payment)
    db.commit()
    return {"message": "Payment Successful", "transaction_id": txn_id}

@app.get("/api/fee/receipt/{transaction_id}")
def download_receipt(transaction_id: str, db: Session = Depends(get_db)):
    payment = db.query(FeePayment).filter_by(transaction_id=transaction_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Transaction record not found")
    student = db.query(Student).filter_by(roll_no=payment.roll_no).first()
    
    pdf_bytes = generate_fee_receipt_pdf(
        transaction_id=payment.transaction_id,
        roll_no=payment.roll_no,
        student_name=student.name if student else "Student",
        amount=payment.amount,
        fee_type=payment.fee_type,
        date_str=payment.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    )
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=Receipt_{transaction_id}.pdf"})

# ----------------- DYNAMIC OUT-PASS SYSTEM -----------------
@app.post("/api/gatepass/generate")
def create_gate_pass(roll_no: str = Form(...), reason: str = Form(...), db: Session = Depends(get_db)):
    pass_id = f"GP-{uuid.uuid4().hex[:8].upper()}"
    valid_until = datetime.utcnow() + timedelta(hours=12)
    
    gate_pass = GatePass(pass_id=pass_id, roll_no=roll_no, reason=reason, valid_until=valid_until)
    db.add(gate_pass)
    db.commit()
    
    qr_code_b64 = generate_gate_pass_qr(pass_id, roll_no, valid_until)
    return {"pass_id": pass_id, "valid_until": valid_until, "qr_code": qr_code_b64}