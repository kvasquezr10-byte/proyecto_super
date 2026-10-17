from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.productos import router as productos_router
from routes.categorias import router as categorias_router
from routes.clientes import router as clientes_router
from routes.proveedores import router as proveedores_router
from routes.compras import router as compras_router
from routes.ventas import router as ventas_router
from routes.dashboard import router as dashboard_router
from routes.auth import router as auth_router 

app = FastAPI(title="API Sistema Supermercado - UMG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(productos_router, prefix="/api")
app.include_router(categorias_router, prefix="/api")
app.include_router(clientes_router, prefix="/api")
app.include_router(proveedores_router, prefix="/api")
app.include_router(compras_router, prefix="/api")
app.include_router(ventas_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(auth_router, prefix="/api")  