import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_fee_receipt_pdf(transaction_id: str, roll_no: str, student_name: str, amount: float, fee_type: str, date_str: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=15
    )
    story.append(Paragraph("CAMPUS ERP - PAYMENT RECEIPT", title_style))
    story.append(Spacer(1, 10))

    data = [
        ["Transaction ID:", transaction_id],
        ["Date & Time:", date_str],
        ["Student Roll No:", roll_no],
        ["Student Name:", student_name],
        ["Fee Category:", fee_type],
        ["Amount Paid:", f"INR {amount:.2f}"],
        ["Status:", "SUCCESSFUL"]
    ]

    t = Table(data, colWidths=[150, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    
    footer = Paragraph("This is a system-generated receipt and requires no physical signature.", styles['Italic'])
    story.append(footer)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()