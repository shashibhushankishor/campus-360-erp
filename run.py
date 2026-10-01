"""
Campus ERP Portal Launcher
Starts the Uvicorn server for the Campus ERP system.
"""
import sys
import uvicorn
import os
if __name__ == "__main__":
    # Ensure current dir is in PYTHONPATH
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    print("=" * 70)
    print("  CAMPUS ERP PORTAL (ADMINISTRATION & OPERATIONAL SERVICES)")
    print("  - API-First Architecture on FastAPI + Uvicorn")
    print("  - Paperless No-Dues Clearance Matrix")
    print("  - Dynamic Fee Ledger & Digital E-Receipts (ReportLab)")
    print("  - Dynamic QR Gate-Pass System for Hostel Security")
    print("  - Strict 24-Hour SLA Operational Grievance Hub")
    print("  - Mess Ratings & 7-Days Menu Voting System")
    print("  - Security Theft & CCTV Video Investigation Desk")
    print("=" * 70)
    print("Starting server on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)