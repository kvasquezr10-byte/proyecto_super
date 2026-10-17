from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from db import Cliente, get_db

router = APIRouter()


class ClienteSchema(BaseModel):
    nit: str
    nombres: str
    apellidos: Optional[str] = ""
    telefono: Optional[str] = ""
    email: Optional[str] = ""
    correo: Optional[str] = ""
    direccion: Optional[str] = ""

    class Config:
        from_attributes = True


@router.get("/clientes")
def obtener_clientes(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    clientes = db.query(Cliente).all()
    resultado: list[dict[str, object]] = []
    for c in clientes:
        cliente_data: dict[str, object] = {
            "id": c.id,
            "nit": c.nit,
            "nombres": c.nombres,
            "apellidos": c.apellidos,
            "cliente": f"{c.nombres} {c.apellidos or ''}".strip(),
            "telefono": c.telefono,
            "email": c.email,
            "correo": c.email,
            "direccion": c.direccion,
            "estado": c.estado,
        }
        resultado.append(cliente_data)
    return resultado


@router.post("/clientes")
def crear_cliente(cliente: ClienteSchema, db: Session = Depends(get_db)):
    correo_final = cliente.email or cliente.correo or ""
    nuevo = Cliente(
        nit=cliente.nit,
        nombres=cliente.nombres,
        apellidos=cliente.apellidos or "",
        telefono=cliente.telefono or "",
        email=correo_final,
        direccion=cliente.direccion or "",
        estado=True,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/clientes/{cliente_id}")
def actualizar_cliente(
    cliente_id: int, cliente: ClienteSchema, db: Session = Depends(get_db)
):
    cli_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cli_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cli_db.nit = cliente.nit
    cli_db.nombres = cliente.nombres
    cli_db.apellidos = cliente.apellidos or ""
    cli_db.telefono = cliente.telefono or ""
    cli_db.email = cliente.email or cliente.correo or ""
    cli_db.direccion = cliente.direccion or ""

    db.commit()
    db.refresh(cli_db)
    return cli_db


@router.delete("/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cli_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cli_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    try:
        db.delete(cli_db)
        db.commit()
        return {"message": "Cliente eliminado físicamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el cliente porque tiene ventas asociadas.",
        )