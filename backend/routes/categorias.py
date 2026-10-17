import os
import sys
from typing import Any, Dict, List, Optional, cast
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Garantizar resolución de rutas sin advertencias de Pylance
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import Categoria, get_db

router = APIRouter()
CategoriaModel = cast(Any, Categoria)


class CategoriaSchema(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    codigo: Optional[str] = ""

    class Config:
        from_attributes = True


def generar_siguiente_codigo(db: Session) -> str:
    """Calcula dinámicamente el siguiente código correlativo CAT-00X."""
    categorias = db.query(CategoriaModel).all()
    max_num = 0
    for c in categorias:
        code = getattr(c, "codigo", "") or ""
        if code.startswith("CAT-"):
            try:
                num = int(code.replace("CAT-", ""))
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"CAT-{(max_num + 1):03d}"


@router.get("/categorias", response_model=List[Dict[str, Any]])
def obtener_categorias(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    try:
        categorias = db.query(Categoria).all()
        resultado: List[Dict[str, Any]] = []
        for c in categorias:
            codigo_val = getattr(c, "codigo", "") or f"CAT-{c.id:03d}"
            resultado.append({
                "id": c.id,
                "codigo": codigo_val,
                "nombre": c.nombre,
                "descripcion": c.descripcion or "",
            })
        return resultado
    except Exception as e:
        print(f"Error al obtener categorías: {e}")
        return []


@router.post("/categorias")
def crear_categoria(
    cat: CategoriaSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    try:
        # Generar correlativo dinámico si no fue enviado desde el frontend
        codigo_final = cat.codigo if cat.codigo else generar_siguiente_codigo(db)

        nueva = Categoria(
            nombre=cat.nombre,
            descripcion=cat.descripcion or "",
        )
        if hasattr(Categoria, "codigo"):
            setattr(nueva, "codigo", codigo_final)

        db.add(nueva)
        db.commit()
        db.refresh(nueva)
        return {
            "id": nueva.id,
            "codigo": codigo_final,
            "nombre": nueva.nombre,
            "descripcion": nueva.descripcion,
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
            status_code=500, detail=f"Error al guardar categoría: {str(e)}"
        )


@router.put("/categorias/{categoria_id}")
def actualizar_categoria(
    categoria_id: int, cat: CategoriaSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    c_db = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not c_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    try:
        c_db.nombre = cat.nombre
        c_db.descripcion = cat.descripcion or ""
        if hasattr(c_db, "codigo") and cat.codigo:
            setattr(c_db, "codigo", cat.codigo)

        db.commit()
        db.refresh(c_db)
        return {
            "id": c_db.id,
            "codigo": getattr(c_db, "codigo", ""),
            "nombre": c_db.nombre,
            "descripcion": c_db.descripcion,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar categoría: {str(e)}"
        )


@router.delete("/categorias/{categoria_id}")
def eliminar_categoria(
    categoria_id: int, db: Session = Depends(get_db)
) -> Dict[str, str]:
    c_db = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not c_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    try:
        db.delete(c_db)
        db.commit()
        return {"message": "Categoría eliminada exitosamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la categoría porque tiene productos asociados.",
        )