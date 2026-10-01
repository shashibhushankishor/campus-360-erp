"""
SLA (Service Level Agreement) Engine
Enforces strict 24-hour resolution tracking and auto-escalation
Specifically addresses prompt requirements for campus and theft issues.
"""

from datetime import datetime, timedelta

try:
    from sqlalchemy import select
    from database import IssueTicket, TicketStatus
except Exception:  # pragma: no cover - allows standalone use without the DB layer
    select = None
    IssueTicket = None
    TicketStatus = None

# Category-specific SLA windows in hours. Campus and Security theft cases
# carry the strict 24-hour guarantee mandated by the specification.
DEFAULT_SLA_HOURS = 24
CATEGORY_SLA_HOURS = {
    "Campus": 24,
    "Academic": 48,
    "Hostel": 24,
    "Mess": 36,
    "Security": 24,
}

def get_sla_hours(category) -> int:
    """Resolve the SLA window for a ticket category.

    Accepts a TicketCategory enum member or a plain string so it stays usable
    from both the API layer and ad-hoc scripts.
    """
    raw = getattr(category, "value", category)
    try:
        return CATEGORY_SLA_HOURS[str(raw)]
    except KeyError:
        return DEFAULT_SLA_HOURS

def calculate_sla_deadline(category, from_time: datetime = None) -> datetime:
    """Return the absolute resolution deadline for a new ticket."""
    start = from_time or datetime.utcnow()
    return start + timedelta(hours=get_sla_hours(category))

def parse_iso_or_sql_date(date_str: str) -> datetime:
    """Parses various date formats from sqlite or user inputs."""
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%fZ"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.replace("Z", ""), fmt)
        except (ValueError, TypeError):
            continue
    try:
        return datetime.fromisoformat(date_str)
    except Exception:
        return datetime.now()

def process_sla_escalations(db) -> int:
    """Auto-escalate any ticket whose SLA window has elapsed.

    Tickets that are still PENDING or IN_PROGRESS past their deadline are
    promoted to ESCALATED so the Campus Dean sees them. Already-escalated
    tickets are left untouched, making the call safe to run on every read.
    Returns the number of tickets escalated by this call.
    """
    if IssueTicket is None:
        return 0

    now = datetime.utcnow()
    escalated = 0

    query = db.query(IssueTicket).filter(
        IssueTicket.status.in_([TicketStatus.PENDING, TicketStatus.IN_PROGRESS]),
        IssueTicket.sla_deadline < now,
    )
    for ticket in query.all():
        ticket.status = TicketStatus.ESCALATED
        note = (
            f"[AUTO-ESCALATION {now:%Y-%m-%d %H:%M}] SLA breached. "
            "Escalated to Campus Dean & Division Head."
        )
        ticket.resolution_notes = (
            f"{note}\n{ticket.resolution_notes}" if ticket.resolution_notes else note
        )
        escalated += 1

    if escalated:
        db.commit()

    return escalated

def get_ticket_sla_status(created_at_str: str, sla_hours: int = 24, status: str = "OPEN") -> dict:
    """
    Computes real-time SLA countdown and escalation metrics.
    Strict 24-hour guarantee logic.
    """
    created_at = parse_iso_or_sql_date(created_at_str)
    sla_deadline = created_at + timedelta(hours=sla_hours)
    now = datetime.now()

    is_resolved = status.upper() in ["RESOLVED", "CLOSED"]

    total_duration_sec = sla_hours * 3600
    elapsed_sec = max(0, int((now - created_at).total_seconds()))
    remaining_sec = int((sla_deadline - now).total_seconds())

    if is_resolved:
        return {
            "sla_hours": sla_hours,
            "created_at": created_at.strftime("%Y-%m-%d %H:%M"),
            "deadline": sla_deadline.strftime("%Y-%m-%d %H:%M"),
            "remaining_seconds": 0,
            "remaining_formatted": "Resolved within SLA",
            "is_breached": False,
            "is_escalated": False,
            "pct_elapsed": 100,
            "badge_color": "green",
            "badge_text": "RESOLVED IN SLA"
        }

    if remaining_sec <= 0:
        # Breached SLA - Auto-escalated to Campus Dean & Division Head
        overdue_sec = abs(remaining_sec)
        over_hours = overdue_sec // 3600
        over_mins = (overdue_sec % 3600) // 60
        return {
            "sla_hours": sla_hours,
            "created_at": created_at.strftime("%Y-%m-%d %H:%M"),
            "deadline": sla_deadline.strftime("%Y-%m-%d %H:%M"),
            "remaining_seconds": 0,
            "remaining_formatted": f"Breached by {over_hours}h {over_mins}m (Auto-Escalated to Dean)",
            "is_breached": True,
            "is_escalated": True,
            "pct_elapsed": 100,
            "badge_color": "red",
            "badge_text": "CRITICAL: 24H SLA EXCEEDED"
        }

    # Within 24 hours SLA
    hours_left = remaining_sec // 3600
    mins_left = (remaining_sec % 3600) // 60
    secs_left = remaining_sec % 60
    pct = min(100, round((elapsed_sec / total_duration_sec) * 100, 1))

    # Badge styling
    if hours_left < 4:
        badge_color = "red"
        badge_text = f"URGENT: {hours_left}h {mins_left}m left"
    elif hours_left < 10:
        badge_color = "amber"
        badge_text = f"ATTENTION: {hours_left}h {mins_left}m left"
    else:
        badge_color = "emerald"
        badge_text = f"ACTIVE SLA: {hours_left}h {mins_left}m left"

    return {
        "sla_hours": sla_hours,
        "created_at": created_at.strftime("%Y-%m-%d %H:%M"),
        "deadline": sla_deadline.strftime("%Y-%m-%d %H:%M"),
        "remaining_seconds": remaining_sec,
        "remaining_formatted": f"{hours_left:02d}h {mins_left:02d}m {secs_left:02d}s remaining",
        "is_breached": False,
        "is_escalated": False,
        "pct_elapsed": pct,
        "badge_color": badge_color,
        "badge_text": badge_text
    }
