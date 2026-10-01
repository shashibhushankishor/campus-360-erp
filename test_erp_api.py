import pytest
from fastapi.testclient import TestClient
from main import app
from database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    client.post("/api/seed")

def test_seed_and_no_dues():
    response = client.get("/api/no-dues/2026CS101")
    assert response.status_code == 200
    assert "clearance" in response.json()

def test_ticket_creation_sla():
    response = client.post(
        "/api/tickets/create",
        data={
            "roll_no": "2026CS101",
            "category": "Campus",
            "sub_category": "Broken Gate",
            "description": "Main hostel gate hinge is broken."
        }
    )
    assert response.status_code == 200
    assert "ticket_id" in response.json()

def test_gatepass_generation():
    response = client.post(
        "/api/gatepass/generate",
        data={"roll_no": "2026CS101", "reason": "Medical"}
    )
    assert response.status_code == 200
    assert "qr_code" in response.json()