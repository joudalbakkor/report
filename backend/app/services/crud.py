"""Generic CRUD service usable by every model.

Keeps route handlers thin and avoids repeating the same query logic for each
entity. ``obj_in`` may be a Pydantic model or a plain dict.
"""
from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


def _to_dict(obj_in: Any, *, exclude_unset: bool = False) -> dict:
    if isinstance(obj_in, BaseModel):
        return obj_in.model_dump(exclude_unset=exclude_unset)
    return dict(obj_in)


class CRUDService(Generic[ModelType]):
    def __init__(self, model: type[ModelType]) -> None:
        self.model = model

    def get(self, db: Session, obj_id: int) -> ModelType | None:
        return db.get(self.model, obj_id)

    def list(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        return (
            db.query(self.model)
            .order_by(self.model.id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self, db: Session) -> int:
        return db.query(self.model).count()

    def create(self, db: Session, obj_in: Any) -> ModelType:
        db_obj = self.model(**_to_dict(obj_in))
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, obj_in: Any) -> ModelType:
        for field, value in _to_dict(obj_in, exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, db_obj: ModelType) -> None:
        db.delete(db_obj)
        db.commit()
