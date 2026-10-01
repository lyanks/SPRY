from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate


async def list_meetings(session: AsyncSession) -> list[Meeting]:
    result = await session.execute(
        select(Meeting).order_by(Meeting.starts_at.asc())
    )
    return list(result.scalars().all())


async def create_meeting(session: AsyncSession, payload: MeetingCreate) -> Meeting:
    meeting = Meeting(
        title=payload.title,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        attendee_count=payload.attendee_count,
    )
    session.add(meeting)
    await session.flush()
    await session.refresh(meeting)
    return meeting
