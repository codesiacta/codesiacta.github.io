"""Genera dashboard/datos.js a partir del Excel de experiencia de CODESIA C.T.A.

Uso (desde la carpeta codesia-web):
    python herramientas/actualizar_dashboard.py

Lee la hoja "EXPERIENCIA TOTAL CODESIA CTA" del archivo
"../EXPERIENCIA CODESIA CTA 2026.xlsx" y solo publica datos agregados en SMMLV
(no publica valores en pesos, carpetas ni indicadores de terceros).
Las cifras oficiales del certificado RUP se editan a mano en RUP más abajo.
"""
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
EXCEL = RAIZ.parent / "EXPERIENCIA CODESIA CTA 2026.xlsx"
SALIDA = RAIZ / "dashboard" / "datos.js"
HOJA = "EXPERIENCIA TOTAL CODESIA CTA"

# Cifras del certificado RUP (Cámara de Comercio del Huila). Actualizar al renovar.
RUP = {
    "contratos": 155,
    "smmlv": 51612,
    "proponente": "813",
    "renovado": "09/04/2026",
    "liquidez": 6.28,
    "endeudamiento": 0.15,
    "corte_financiero": "31/12/2025",
    "fundacion": 1993,
}

# Columnas de la hoja (base 0)
C_CONSEC, C_OBJETO, C_CONTRATANTE, C_FORMA = 0, 8, 9, 11
C_INI, C_FIN, C_SMMLV, C_ESTADO = 15, 18, 24, 26

LINEAS = [
    ("riego", "Distritos de riego"),
    ("agua", "Agua y saneamiento"),
    ("edificaciones", "Edificaciones e infraestructura educativa"),
    ("estudios", "Estudios y diseños"),
    ("interventoria", "Interventoría"),
    ("vias", "Vías, urbanismo e industria"),
    ("ambiental", "Ambiental y asistencia técnica"),
]

DEPARTAMENTOS = [
    ("La Guajira", r"\b(LA GUAJIRA|RIOHACHA|MAICAO|MANAURE)\b"),
    ("Valle del Cauca", r"\b(VALLE DEL CAUCA|ANDALUCIA|BUGA|CERRITO)\b"),
    ("Cauca", r"(?<!VALLE DEL )\bCAUCA\b|\bMERCADERES\b"),
    ("Cundinamarca", r"\b(SOACHA|CUNDINAMARCA)\b"),
    ("Boyacá", r"\b(BOYACA|SAN MATEO|SOCOTA|CIMARRONA)\b"),
    ("Caquetá", r"\b(CAQUETA|FLORENCIA)\b"),
    ("Magdalena", r"\b(ARACATACA|ANDRES BELLO)\b"),
    ("Meta", r"\b(META|CUBARRAL|CALVARIO)\b"),
    ("Norte de Santander", r"\b(NORTE DE SANTANDER|SAN CAYETANO|LABATECA|NORTESANTANDEREANA)\b"),
    ("Tolima", r"\b(TOLIMA|ORTEGA|COELLO)\b"),
    ("Putumayo", r"\b(PUTUMAYO|MOCOA|ORITO|YARUMO|CORPOAMAZONIA)\b"),
]
# Huila es la sede: se asigna si el contrato no menciona otro departamento o nombra al Huila / Neiva
HUILA = r"\b(HUILA|NEIVA)\b"

# Nombre corto y tipo de cliente, por patrón sobre la razón social
CLIENTES = [
    (r"UTRAHUILCA", "UTRAHUILCA", "solidario"),
    (r"ASOCIACION DE COOPERATIVAS|ASOCOOPH", "ASOCOOPH", "solidario"),
    (r"GOBERNACION DEL HUILA|DEPARTAMENTO DEL HUILA", "Gobernación del Huila", "publico"),
    (r"EMPRESAS PUBLICAS DE NEIVA", "Empresas Públicas de Neiva", "publico"),
    (r"ALCALDIA DE NEIVA|MUNICIPIO DE NEIVA|INSTITUTO DE ASUNTOS AGROPECUARIOS|INSTITUTO DE DESARROLLO AGROPECUARIO|IDAMA", "Alcaldía de Neiva", "publico"),
    (r"AGUAS DEL HUILA|SOCIEDAD DE ACUEDUCTOS", "Aguas del Huila", "publico"),
    (r"INCODER|DESARROLLO RURAL|ADECUACION DE TIERRAS - |INAT", "INCODER / INAT", "publico"),
    (r"CORPORACION AUTONOMA REGIONAL DEL ALTO MAGDALENA", "CAM", "publico"),
    (r"INFIHUILA", "INFIHUILA", "publico"),
    (r"ICBF|BIENESTAR FAMILIAR", "ICBF", "publico"),
    (r"UNIVERSIDAD SURCOLOMBIANA", "Universidad Surcolombiana", "publico"),
    (r"DIAN", "DIAN", "publico"),
    (r"CORPOAMAZONIA", "CORPOAMAZONIA", "publico"),
    (r"GOBERNACION DEL DEPARTAMENTO DEL CAUCA", "Gobernación del Cauca", "publico"),
    (r"ASOCIACION DE USUARIOS|ASOTRESPASOS|ASOBALSEADERO|ASOPORVENIR|NORTESANTANDEREANA", "Asociaciones de usuarios de riego", "solidario"),
    (r"COOPERATIVA|FUNDAUTRAHUILCA|FUNDACION", None, "solidario"),
    (r"ALCALDIA|MUNICIPIO|GOBERNACION|DEPARTAMENTO|INSTITUTO|E\.S\.P|EMPRESAS PUBLICAS|SECRETARIA|BACHILLERATO|FEDERACION NACIONAL|CORPORACION AUTONOMA", None, "publico"),
]


def normalizar(texto):
    texto = unicodedata.normalize("NFD", str(texto or "").upper())
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def anio(fila, col):
    """Las fechas vienen como datetime o como día / mes / año en tres columnas."""
    valor = fila[col]
    if isinstance(valor, (datetime, date)):
        return valor.year
    a = fila[col + 2]
    return int(a) if isinstance(a, (int, float)) and a > 1900 else None


def linea(objeto):
    o = normalizar(objeto)
    if re.search(r"INTERVENTORIA|GERENCIA TECNICA", o):
        return "interventoria"
    if re.search(r"CURSO|CAPACITACION|SEMINARIO|ASISTENCIA TECNICA", o):
        return "ambiental"
    if re.search(r"ESTUDIO|DISENO|FACTIBILIDAD|CONSULTORIA|AVALUO|TOPOGRAFIA|PLAN DE ORDENAMIENTO|PERFIL AMBIENTAL|PRIORIZACION|LEVANTAMIENTO", o):
        return "estudios"
    if re.search(r"RIEGO|IRRIGACION|ADECUACION DE TIERRAS|SISTEMA DE BOMBEO", o):
        return "riego"
    if re.search(r"REFORESTACION|ARBORIZACION|EROSION|MANEJO INTEGRAL|MANEJO AMBIENTAL|CAUCE|RESIDUOS|AISLAMIENTO", o):
        return "ambiental"
    if re.search(r"ACUEDUCTO|ALCANTARILLADO|COLECTOR|GAS DOMICILIARIO|AGUAS LLUVIAS|TANQUE DE|VALVULA|ACCESORIOS|CARCAMO", o):
        return "agua"
    if re.search(r"INSTITUCION|EDUCATIV|ESCUELA|AULA|RESTAURANTE|LABORATORIO|BIBLIOTECA|COLEGIO|ESCOLAR|DOCENTE|OFICINA|SALA DE|REMODELACION|MANTENIMIENTO|REPARACION", o):
        return "edificaciones"
    if re.search(r"BATERIA|SANITARI", o):
        return "agua"
    return "vias"


def departamentos(texto):
    t = normalizar(texto)
    encontrados = [nombre for nombre, patron in DEPARTAMENTOS if re.search(patron, t)]
    if re.search(HUILA, t) or not encontrados:
        encontrados.insert(0, "Huila")
    return encontrados


def cliente(razon_social):
    r = normalizar(razon_social)
    for patron, nombre, tipo in CLIENTES:
        if re.search(patron, r):
            return nombre, tipo
    return None, "privado"


def leer_contratos():
    hoja = openpyxl.load_workbook(EXCEL, data_only=True)[HOJA]
    contratos = []
    for fila in hoja.iter_rows(min_row=7, values_only=True):
        if not isinstance(fila[C_CONSEC], (int, float)) or not fila[C_OBJETO]:
            continue
        smmlv = fila[C_SMMLV] or 0
        if smmlv <= 0:
            continue
        nombre, tipo = cliente(fila[C_CONTRATANTE])
        contratos.append({
            "objeto": " ".join(str(fila[C_OBJETO]).split()),
            "contratante": " ".join(str(fila[C_CONTRATANTE]).split()),
            "cliente": nombre,
            "tipo_cliente": tipo,
            "forma": str(fila[C_FORMA] or "I").strip().upper(),
            "anio": anio(fila, C_FIN) or anio(fila, C_INI),
            "smmlv": float(smmlv),
            "linea": linea(fila[C_OBJETO]),
            "departamentos": departamentos(f"{fila[C_OBJETO]} {fila[C_CONTRATANTE]}"),
            "liquidado": normalizar(fila[C_ESTADO]) == "LIQUIDADO",
        })
    return contratos


def resumir(contratos):
    total = sum(c["smmlv"] for c in contratos)

    por_linea = []
    for clave, nombre in LINEAS:
        grupo = [c for c in contratos if c["linea"] == clave]
        por_linea.append({
            "clave": clave,
            "nombre": nombre,
            "contratos": len(grupo),
            "smmlv": round(sum(c["smmlv"] for c in grupo)),
            "participacion": round(100 * sum(c["smmlv"] for c in grupo) / total, 1),
        })
    por_linea.sort(key=lambda x: -x["smmlv"])

    por_decada = defaultdict(lambda: {"contratos": 0, "smmlv": 0.0})
    for c in contratos:
        if c["anio"]:
            d = c["anio"] // 5 * 5
            por_decada[d]["contratos"] += 1
            por_decada[d]["smmlv"] += c["smmlv"]
    trayectoria = [
        {"periodo": f"{d}–{min(d + 4, date.today().year)}", "contratos": v["contratos"], "smmlv": round(v["smmlv"])}
        for d, v in sorted(por_decada.items())
    ]

    por_dpto = Counter(d for c in contratos for d in c["departamentos"])
    presencia = [{"nombre": n, "contratos": k} for n, k in por_dpto.most_common()]

    por_tipo = defaultdict(lambda: {"contratos": 0, "smmlv": 0.0})
    for c in contratos:
        por_tipo[c["tipo_cliente"]]["contratos"] += 1
        por_tipo[c["tipo_cliente"]]["smmlv"] += c["smmlv"]
    nombres_tipo = {"publico": "Entidades públicas", "solidario": "Sector solidario y asociaciones", "privado": "Empresas privadas"}
    tipos = [
        {"clave": k, "nombre": nombres_tipo[k], "contratos": v["contratos"], "participacion": round(100 * v["smmlv"] / total, 1)}
        for k, v in sorted(por_tipo.items(), key=lambda kv: -kv[1]["smmlv"])
    ]

    por_cliente = defaultdict(lambda: {"contratos": 0, "smmlv": 0.0})
    for c in contratos:
        if c["cliente"]:
            por_cliente[c["cliente"]]["contratos"] += 1
            por_cliente[c["cliente"]]["smmlv"] += c["smmlv"]
    clientes = [
        {"nombre": n, "contratos": v["contratos"], "smmlv": round(v["smmlv"])}
        for n, v in sorted(por_cliente.items(), key=lambda kv: -kv[1]["smmlv"])
    ][:8]

    formas = Counter({"I": "individual", "C": "consorcio", "UT": "union_temporal"}.get(c["forma"], "individual") for c in contratos)

    anios = [c["anio"] for c in contratos if c["anio"]]
    return {
        "rup": RUP,
        "detalle": {
            "contratos": len(contratos),
            "smmlv": round(total),
            "liquidados": sum(c["liquidado"] for c in contratos),
            "departamentos": len(por_dpto),
            "clientes": len({normalizar(c["contratante"])[:30] for c in contratos}),
            "desde": min(anios),
            "hasta": max(anios),
            "formas": dict(formas),
        },
        "lineas": por_linea,
        "trayectoria": trayectoria,
        "presencia": presencia,
        "tipos_cliente": tipos,
        "clientes": clientes,
    }


def main():
    if not EXCEL.exists():
        sys.exit(f"No se encontró el Excel: {EXCEL}")
    datos = resumir(leer_contratos())
    datos["generado"] = date.today().isoformat()
    SALIDA.parent.mkdir(exist_ok=True)
    SALIDA.write_text(
        "// Archivo generado por herramientas/actualizar_dashboard.py. No editar a mano.\n"
        f"window.DATOS = {json.dumps(datos, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"Listo: {SALIDA.relative_to(RAIZ)} ({datos['detalle']['contratos']} contratos)")


if __name__ == "__main__":
    main()
