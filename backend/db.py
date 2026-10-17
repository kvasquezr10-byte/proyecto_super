import os
from typing import Optional
from dotenv import load_dotenv
from sqlalchemy import ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/postgres",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]
    nombre: Mapped[str]
    rol: Mapped[str] = mapped_column(default="bodega")


class Cliente(Base):
    __tablename__ = "clientes"
    id: Mapped[int] = mapped_column(primary_key=True)
    nit: Mapped[str]
    nombres: Mapped[str]
    apellidos: Mapped[Optional[str]] = mapped_column(default="")
    telefono: Mapped[Optional[str]] = mapped_column(default="")
    email: Mapped[Optional[str]] = mapped_column(default="")
    direccion: Mapped[Optional[str]] = mapped_column(default="")
    estado: Mapped[bool] = mapped_column(default=True)


class Proveedor(Base):
    __tablename__ = "proveedores"
    id: Mapped[int] = mapped_column(primary_key=True)
    nit: Mapped[str]
    nombre: Mapped[str]
    contacto: Mapped[Optional[str]] = mapped_column(default="")
    telefono: Mapped[Optional[str]] = mapped_column(default="")
    email: Mapped[Optional[str]] = mapped_column(default="")
    direccion: Mapped[Optional[str]] = mapped_column(default="")
    estado: Mapped[bool] = mapped_column(default=True)


class Categoria(Base):
    __tablename__ = "categorias"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str]
    descripcion: Mapped[Optional[str]] = mapped_column(default="")


class Producto(Base):
    __tablename__ = "productos"
    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(unique=True)
    nombre: Mapped[str]
    categoria_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categorias.id")
    )
    descripcion: Mapped[Optional[str]] = mapped_column(default="")
    precio_compra: Mapped[float] = mapped_column(default=0.0)
    precio_venta: Mapped[float] = mapped_column(default=0.0)
    stock: Mapped[int] = mapped_column("existencia", default=0)


class Venta(Base):
    __tablename__ = "ventas"
    id: Mapped[int] = mapped_column(primary_key=True)
    numero: Mapped[Optional[str]] = mapped_column(default="")
    cliente_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("clientes.id")
    )
    producto_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("productos.id")
    )
    cantidad: Mapped[int] = mapped_column(default=1)
    precio_venta: Mapped[float] = mapped_column(default=0.0)
    usuario_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    total: Mapped[float] = mapped_column(default=0.0)
    estado: Mapped[Optional[str]] = mapped_column(default="COMPLETADO")


class Compra(Base):
    __tablename__ = "compras"
    id: Mapped[int] = mapped_column(primary_key=True)
    numero: Mapped[Optional[str]] = mapped_column(default="")
    proveedor_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("proveedores.id")
    )
    producto_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("productos.id")
    )
    cantidad: Mapped[int] = mapped_column(default=1)
    precio_compra: Mapped[float] = mapped_column(default=0.0)
    usuario_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    total: Mapped[float] = mapped_column(default=0.0)
    estado: Mapped[Optional[str]] = mapped_column(default="COMPLETADO")