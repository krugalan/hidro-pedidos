"""
Genera SQL para importar clientes desde el Excel de contactos.
Uso: python3 scripts/import_clientes.py > supabase/import_clientes.sql
"""

import openpyxl
import re
import sys

EXCEL_PATH = "/Users/krugalan/Downloads/Contactos DOC-20260921-WA0129.xlsx"
SHEET_NAME = "Clientes"


def normalizar_tel(tel):
    if not tel:
        return None
    return re.sub(r"[\s\-]", "", str(tel))


def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def main():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb[SHEET_NAME]
    rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[0] and str(r[0]).strip()]

    lines = [
        "-- Import clientes desde Contactos DOC-20260921-WA0129.xlsx",
        f"-- {len(rows)} clientes",
        "-- Ejecutar en el SQL Editor de Supabase",
        "",
        "BEGIN;",
        "",
    ]

    for nombre, celular, direccion, *_ in rows:
        nombre = str(nombre).strip()
        tel = normalizar_tel(celular)
        if direccion:
            lines += [
                "WITH _c AS (",
                f"  INSERT INTO clientes (nombre, whatsapp) VALUES ({esc(nombre)}, {esc(tel)}) RETURNING id",
                ")",
                f"INSERT INTO direcciones (cliente_id, calle) SELECT id, {esc(direccion)} FROM _c;",
            ]
        else:
            lines.append(
                f"INSERT INTO clientes (nombre, whatsapp) VALUES ({esc(nombre)}, {esc(tel)});"
            )

    lines += ["", "COMMIT;", ""]
    print("\n".join(lines))


if __name__ == "__main__":
    main()
