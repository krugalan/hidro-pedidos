import type { DatosCliente } from "../types";

const CLAVE = "hidro_cliente";

export function getCliente(): DatosCliente | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return null;
    return JSON.parse(raw) as DatosCliente;
  } catch {
    return null;
  }
}

export function saveCliente(datos: DatosCliente): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Si falla localStorage, la app sigue igual
  }
}
