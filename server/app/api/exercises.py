from typing import List, Optional
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_exercises():
    # Placeholder endpoint to be connected to Kedro outputs later
    return {"exercises": []}
