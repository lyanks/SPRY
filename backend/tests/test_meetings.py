import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_meetings_empty(anon_client: AsyncClient):
    response = await anon_client.get("/api/meetings")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_and_list_meeting(anon_client: AsyncClient):
    payload = {
        "title": "Weekly Sprint Planning",
        "starts_at": "2026-10-01T10:00:00Z",
        "ends_at": "2026-10-01T10:45:00Z",
        "attendee_count": 6,
    }
    create_res = await anon_client.post("/api/meetings", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["title"] == payload["title"]
    assert created_data["attendee_count"] == 6
    assert "id" in created_data

    list_res = await anon_client.get("/api/meetings")
    assert list_res.status_code == 200
    meetings = list_res.json()
    assert len(meetings) == 1
    assert meetings[0]["id"] == created_data["id"]
    assert meetings[0]["title"] == "Weekly Sprint Planning"
