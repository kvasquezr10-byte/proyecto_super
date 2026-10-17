from typing import TypedDict

from db import Producto, Venta, get_db
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


class DashboardStats(TypedDict):
    total_productos: int
    total_ventas: int
    ingresos_totales: float
    bajo_stock: int


@router.get("/dashboard/stats")
def obtener_estadisticas(db: Session = Depends(get_db)) -> DashboardStats:
    total_productos: int = db.query(Producto).count()
    total_ventas: int = db.query(Venta).count()
    ingresos_raw = db.query(func.sum(Venta.total)).scalar()
    ingresos: float = round(float(ingresos_raw or 0.0), 2)
    bajo_stock: int = db.query(Producto).filter(Producto.stock <= 5).count()

    return {
        "total_productos": total_productos,
        "total_ventas": total_ventas,
        "ingresos_totales": ingresos,
        "bajo_stock": bajo_stock,
    }