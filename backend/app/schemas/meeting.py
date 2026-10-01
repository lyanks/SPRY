from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MeetingBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    starts_at: datetime
    ends_at: datetime
    attendee_count: int = Field(default=1, ge=1)


class MeetingCreate(MeetingBase):
    pass


class MeetingRead(MeetingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
