import qrcode
import io
import base64
from datetime import datetime

def generate_gate_pass_qr(pass_id: str, roll_no: str, valid_until: datetime) -> str:
    payload = f"GATE_PASS|ID:{pass_id}|ROLL:{roll_no}|EXP:{valid_until.isoformat()}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{qr_b64}"