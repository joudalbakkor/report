"""Purchase Pydantic schemas."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PurchaseBase(BaseModel):
    product_id: int
    supplier_name: str
    quantity: int = Field(gt=0)
    unit_cost: float = Field(ge=0)
    total_cost: float = Field(ge=0)
    purchase_date: date


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseUpdate(BaseModel):
    product_id: int | None = None
    supplier_name: str | None = None
    quantity: int | None = Field(default=None, gt=0)
    unit_cost: float | None = Field(default=None, ge=0)
    total_cost: float | None = Field(default=None, ge=0)
    purchase_date: date | None = None


class PurchaseRead(PurchaseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
