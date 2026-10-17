import os
import sys
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import Usuario, get_db

router = APIRouter()


class LoginSchema(BaseModel):
    username: Optional[str] = None
    usuario: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    contrasena: Optional[str] = None
    clave: Optional[str] = None


def procesar_login(data: LoginSchema, db: Session) -> Dict[str, Any]:
    # Obtener credenciales sin importar el nombre de propiedad que envíe el frontend
    user_input = data.username or data.usuario or data.email or ""
    pass_input = data.password or data.contrasena or data.clave or ""

    if not user_input or not pass_input:
        raise HTTPException(
            status_code=400, detail="Debe ingresar usuario y contraseña."
        )

    usr = db.query(Usuario).filter(Usuario.username == user_input).first()

    # Creación automática de respaldo si la tabla no contuviera al usuario admin
    if not usr and user_input == "admin":
        usr = Usuario(
            username="admin",
            password=pass_input,
            nombre="Administrador",
            rol="admin",
        )
        db.add(usr)
        db.commit()
        db.refresh(usr)

    if not usr or usr.password != pass_input:
        raise HTTPException(
            status_code=401, detail="Usuario o contraseña incorrectos"
        )

    user_dict: Dict[str, Any] = {
        "id": usr.id,
        "username": usr.username,
        "nombre": usr.nombre,
        "rol": usr.rol,
    }

    return {
        "message": "Inicio de sesión exitoso",
        "token": f"bearer-token-{usr.id}",
        "access_token": f"bearer-token-{usr.id}",
        "token_type": "bearer",
        "user": user_dict,
        "usuario": user_dict,
    }


@router.post("/login")
@router.post("/auth/login")
def login_endpoint(
    data: LoginSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    return procesar_login(data, db)