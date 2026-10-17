from datetime import datetime
from typing import Any, Dict, List
from db import Cliente, Producto, Usuario, Venta, get_db
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class DetalleVentaSchema(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class VentaSchema(BaseModel):
    cliente_id: int
    detalles: List[DetalleVentaSchema]


@router.get("/ventas", response_model=List[Dict[str, Any]])
def obtener_ventas(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    try:
        ventas = db.query(Venta).all()
        resultado: List[Dict[str, Any]] = []
        for v in ventas:
            cli = db.query(Cliente).filter(Cliente.id == v.cliente_id).first()
            resultado.append({
                "id": v.id,
                "numero": getattr(v, "numero", f"VEN-{v.id}"),
                "cliente_id": v.cliente_id,
                "cliente_nombre": f"{cli.nombres} {cli.apellidos}"
                if cli
                else "Consumidor Final",
                "total": float(v.total or 0.0),
                "estado": getattr(v, "estado", "COMPLETADO"),
            })
        return resultado
    except Exception as e:
        print(f"Error al obtener ventas: {e}")
        return []


@router.post("/ventas")
def registrar_venta(
    data: VentaSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    if not data.cliente_id:
        raise HTTPException(
            status_code=400, detail="Debe seleccionar un cliente válido."
        )

    if not data.detalles:
        raise HTTPException(
            status_code=400,
            detail="La venta debe incluir al menos un producto.",
        )

    cli = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
    if not cli:
        raise HTTPException(
            status_code=400, detail="El cliente seleccionado no existe."
        )

    try:
        total_venta = 0.0
        usr = db.query(Usuario).first()
        usr_id = usr.id if usr else 1

        correlativo = f"VEN-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        for d in data.detalles:
            prod = (
                db.query(Producto).filter(Producto.id == d.producto_id).first()
            )
            if not prod:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto con ID {d.producto_id} no existe.",
                )

            if (prod.stock or 0) < d.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{prod.nombre}'. Disponible: {prod.stock}, solicitado: {d.cantidad}",
                )

            subtotal = float(d.cantidad) * float(d.precio_unitario)
            total_venta += subtotal

            # 1. Descontar existencia del producto
            prod.stock = prod.stock - d.cantidad

            # 2. Registrar directamente en la tabla ventas
            nueva_venta = Venta(
                numero=correlativo,
                cliente_id=data.cliente_id,
                producto_id=d.producto_id,
                cantidad=d.cantidad,
                precio_venta=float(d.precio_unitario),
                usuario_id=usr_id,
                total=subtotal,
                estado="COMPLETADO",
            )
            db.add(nueva_venta)

        db.commit()
        return {
            "message": "Venta registrada exitosamente",
            "numero": correlativo,
            "total": total_venta,
        }

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"Error al registrar venta: {e}")
        raise HTTPException(
            status_code=400, detail=f"Error al registrar en ventas: {str(e)}"
        )