from typing import Any, Dict, List, Optional
from db import Categoria, Producto, get_db
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter()


class ProductoSchema(BaseModel):
    codigo: str
    nombre: str
    categoria_id: Optional[int] = None
    descripcion: Optional[str] = ""
    precio_compra: float = 0.0
    precio_venta: float = 0.0
    stock: int = 0
    stock_minimo: int = 5

    class Config:
        from_attributes = True


@router.get("/productos", response_model=List[Dict[str, Any]])
def obtener_productos(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    try:
        productos = db.query(Producto).all()
        resultado: List[Dict[str, Any]] = []
        for p in productos:
            cat_nombre = "Sin Categoría"
            if p.categoria_id:
                cat = (
                    db.query(Categoria)
                    .filter(Categoria.id == p.categoria_id)
                    .first()
                )
                if cat:
                    cat_nombre = cat.nombre

            resultado.append({
                "id": p.id,
                "codigo": p.codigo,
                "nombre": p.nombre,
                "categoria_id": p.categoria_id,
                "categoria_nombre": cat_nombre,
                "descripcion": p.descripcion or "",
                "precio_compra": float(p.precio_compra or 0.0),
                "precio_venta": float(p.precio_venta or 0.0),
                "stock": p.stock or 0,
                "stock_minimo": 5,
                "estado": "Activo",
            })
        return resultado
    except Exception as e:
        print(f"Error al obtener productos: {e}")
        return []


@router.post("/productos")
def crear_producto(prod: ProductoSchema, db: Session = Depends(get_db)):
    existente = (
        db.query(Producto).filter(Producto.codigo == prod.codigo).first()
    )
    if existente:
        raise HTTPException(
            status_code=400,
            detail=f"El código '{prod.codigo}' ya está registrado con el producto '{existente.nombre}'.",
        )

    if prod.categoria_id:
        cat = (
            db.query(Categoria)
            .filter(Categoria.id == prod.categoria_id)
            .first()
        )
        if not cat:
            prod.categoria_id = None

    try:
        nuevo = Producto(
            codigo=prod.codigo,
            nombre=prod.nombre,
            categoria_id=prod.categoria_id,
            descripcion=prod.descripcion or "",
            precio_compra=prod.precio_compra,
            precio_venta=prod.precio_venta,
            stock=prod.stock,
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Error de integridad en Supabase/PostgreSQL: {str(e)}",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error al guardar producto: {str(e)}"
        )


@router.put("/productos/{producto_id}")
def actualizar_producto(
    producto_id: int, prod: ProductoSchema, db: Session = Depends(get_db)
):
    p_db = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        p_db.codigo = prod.codigo
        p_db.nombre = prod.nombre
        p_db.categoria_id = prod.categoria_id
        p_db.descripcion = prod.descripcion or ""
        p_db.precio_compra = prod.precio_compra
        p_db.precio_venta = prod.precio_venta
        p_db.stock = prod.stock

        db.commit()
        db.refresh(p_db)
        return p_db
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar producto: {str(e)}"
        )


@router.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    p_db = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        db.delete(p_db)
        db.commit()
        return {"message": "Producto eliminado exitosamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el producto porque está referenciado en ventas o compras.",
        )