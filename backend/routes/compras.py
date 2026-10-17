from datetime import datetime
from typing import Any, Dict, List
from db import Compra, Producto, Proveedor, Usuario, get_db
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class DetalleCompraSchema(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class CompraSchema(BaseModel):
    proveedor_id: int
    detalles: List[DetalleCompraSchema]


@router.get("/compras", response_model=List[Dict[str, Any]])
def obtener_compras(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    try:
        compras = db.query(Compra).all()
        resultado: List[Dict[str, Any]] = []
        for c in compras:
            prov = (
                db.query(Proveedor)
                .filter(Proveedor.id == c.proveedor_id)
                .first()
            )
            resultado.append({
                "id": c.id,
                "numero": getattr(c, "numero", f"COM-{c.id}"),
                "proveedor_id": c.proveedor_id,
                "proveedor_nombre": prov.nombre if prov else "Desconocido",
                "total": float(c.total or 0.0),
                "estado": getattr(c, "estado", "COMPLETADO"),
            })
        return resultado
    except Exception as e:
        print(f"Error al obtener compras: {e}")
        return []


@router.post("/compras")
def registrar_compra(
    data: CompraSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    if not data.proveedor_id:
        raise HTTPException(
            status_code=400, detail="Debe seleccionar un proveedor válido."
        )

    if not data.detalles:
        raise HTTPException(
            status_code=400,
            detail="La compra debe incluir al menos un producto.",
        )

    prov = db.query(Proveedor).filter(Proveedor.id == data.proveedor_id).first()
    if not prov:
        raise HTTPException(
            status_code=400, detail="El proveedor seleccionado no existe."
        )

    try:
        total_compra = 0.0
        usr = db.query(Usuario).first()
        usr_id = usr.id if usr else 1

        correlativo = f"COM-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        for d in data.detalles:
            prod = (
                db.query(Producto).filter(Producto.id == d.producto_id).first()
            )
            if not prod:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto con ID {d.producto_id} no existe.",
                )

            subtotal = float(d.cantidad) * float(d.precio_unitario)
            total_compra += subtotal

            # 1. Incrementar existencia del producto
            prod.stock = (prod.stock or 0) + d.cantidad
            prod.precio_compra = float(d.precio_unitario)

            # 2. Registrar directamente en la tabla compras (sin usar detalle_compras)
            nueva_compra = Compra(
                numero=correlativo,
                proveedor_id=data.proveedor_id,
                producto_id=d.producto_id,
                cantidad=d.cantidad,
                precio_compra=float(d.precio_unitario),
                usuario_id=usr_id,
                total=subtotal,
                estado="COMPLETADO",
            )
            db.add(nueva_compra)

        db.commit()
        return {
            "message": "Compra registrada exitosamente",
            "numero": correlativo,
            "total": total_compra,
        }

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"Error al registrar compra: {e}")
        raise HTTPException(
            status_code=400, detail=f"Error al registrar en compras: {str(e)}"
        )