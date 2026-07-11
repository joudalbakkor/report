"""Factory that builds a standard CRUD ``APIRouter`` for a model.

This keeps every entity's endpoints consistent (list / get / create / update /
delete) without duplicating handler code five times.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.crud import CRUDService


def create_crud_router(
    *,
    service: CRUDService,
    read_schema: type,
    create_schema: type,
    update_schema: type,
    prefix: str,
    tags: list[str],
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=tags)
    entity = tags[0] if tags else "item"

    @router.get("/", response_model=list[read_schema])
    def list_items(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        db: Session = Depends(get_db),
    ):
        return service.list(db, skip=skip, limit=limit)

    @router.get("/{item_id}", response_model=read_schema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        obj = service.get(db, item_id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{entity} {item_id} not found",
            )
        return obj

    @router.post(
        "/", response_model=read_schema, status_code=status.HTTP_201_CREATED
    )
    def create_item(payload: create_schema, db: Session = Depends(get_db)):  # type: ignore[valid-type]
        try:
            return service.create(db, payload)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{entity} violates a uniqueness or foreign-key constraint",
            )

    @router.put("/{item_id}", response_model=read_schema)
    def update_item(
        item_id: int,
        payload: update_schema,  # type: ignore[valid-type]
        db: Session = Depends(get_db),
    ):
        obj = service.get(db, item_id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{entity} {item_id} not found",
            )
        return service.update(db, obj, payload)

    @router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_item(item_id: int, db: Session = Depends(get_db)) -> None:
        obj = service.get(db, item_id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{entity} {item_id} not found",
            )
        service.delete(db, obj)

    return router
