"""Sale Pydantic schemas."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class SaleBase(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    total_amount: float = Field(ge=0)
    sale_date: date


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    customer_id: int | None = None
    product_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    unit_price: float | None = Field(default=None, ge=0)
    total_amount: float | None = Field(default=None, ge=0)
    sale_date: date | None = None


class SaleRead(SaleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
