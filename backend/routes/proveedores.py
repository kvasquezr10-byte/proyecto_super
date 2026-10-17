import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Permite la resolución dinámica del directorio backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import Proveedor, get_db

router = APIRouter()


class ProveedorSchema(BaseModel):
    nit: str
    nombre: str
    contacto: Optional[str] = ""
    telefono: Optional[str] = ""
    email: Optional[str] = ""
    direccion: Optional[str] = ""

    class Config:
        from_attributes = True


@router.get("/proveedores", response_model=List[Dict[str, Any]])
def obtener_proveedores(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    try:
        proveedores = db.query(Proveedor).all()
        resultado: List[Dict[str, Any]] = []
        for p in proveedores:
            resultado.append({
                "id": p.id,
                "nit": p.nit,
                "nombre": p.nombre,
                "contacto": p.contacto or "",
                "telefono": p.telefono or "",
                "email": p.email or "",
                "direccion": p.direccion or "",
                "estado": getattr(p, "estado", True),
            })
        return resultado
    except Exception as e:
        print(f"Error al obtener proveedores: {e}")
        return []


@router.post("/proveedores")
def crear_proveedor(
    prov: ProveedorSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    try:
        nuevo = Proveedor(
            nit=prov.nit,
            nombre=prov.nombre,
            contacto=prov.contacto or "",
            telefono=prov.telefono or "",
            email=prov.email or "",
            direccion=prov.direccion or "",
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return {
            "id": nuevo.id,
            "nit": nuevo.nit,
            "nombre": nuevo.nombre,
            "contacto": nuevo.contacto,
            "telefono": nuevo.telefono,
            "email": nuevo.email,
            "direccion": nuevo.direccion,
        }
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Error de integridad en base de datos: {str(e)}",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error al guardar proveedor: {str(e)}"
        )


@router.put("/proveedores/{proveedor_id}")
def actualizar_proveedor(
    proveedor_id: int, prov: ProveedorSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    p_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not p_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    try:
        p_db.nit = prov.nit
        p_db.nombre = prov.nombre
        p_db.contacto = prov.contacto or ""
        p_db.telefono = prov.telefono or ""
        p_db.email = prov.email or ""
        p_db.direccion = prov.direccion or ""

        db.commit()
        db.refresh(p_db)
        return {
            "id": p_db.id,
            "nit": p_db.nit,
            "nombre": p_db.nombre,
            "contacto": p_db.contacto,
            "telefono": p_db.telefono,
            "email": p_db.email,
            "direccion": p_db.direccion,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar proveedor: {str(e)}"
        )


@router.delete("/proveedores/{proveedor_id}")
def eliminar_proveedor(
    proveedor_id: int, db: Session = Depends(get_db)
) -> Dict[str, str]:
    p_db = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not p_db:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    try:
        db.delete(p_db)
        db.commit()
        return {"message": "Proveedor eliminado exitosamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el proveedor porque tiene productos o compras asociadas.",
        )