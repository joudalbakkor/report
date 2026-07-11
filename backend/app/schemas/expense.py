"""Expense Pydantic schemas."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseBase(BaseModel):
    category: str
    description: str | None = None
    amount: float = Field(ge=0)
    expense_date: date


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: str | None = None
    description: str | None = None
    amount: float | None = Field(default=None, ge=0)
    expense_date: date | None = None


class ExpenseRead(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
