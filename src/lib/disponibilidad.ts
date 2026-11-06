import type { Cosecha, FechaEntrega } from "../types/entities";

// Única fuente de verdad de "qué se vende en la tienda".
// La usan tanto la tienda como el admin, para que la vista previa no pueda mentir.

export const hoyIso = () => new Date().toISOString().split("T")[0];

/** Una fecha se ofrece si está abierta, no pasó y tiene al menos un punto de entrega. */
export function fechaDisponible(fecha: FechaEntrega, hoy: string): boolean {
  return fecha.activa && fecha.fecha >= hoy && (fecha.zonas?.length ?? 0) > 0;
}

export function fechasDisponibles(fechas: FechaEntrega[] | undefined, hoy: string): FechaEntrega[] {
  return (fechas ?? [])
    .filter((f) => fechaDisponible(f, hoy))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** La tienda vende una sola cosecha: la más antigua abierta con alguna fecha disponible. */
export function cosechaEnTienda(cosechas: Cosecha[], hoy: string): Cosecha | undefined {
  return cosechas
    .filter((c) => c.activa && fechasDisponibles(c.fechas, hoy).length > 0)
    .sort((a, b) => a.fecha_cosecha.localeCompare(b.fecha_cosecha))[0];
}

export const productosVendibles = (cosecha: Cosecha) =>
  (cosecha.items ?? []).filter((i) => i.producto?.activo);

export type EstadoCosecha =
  | { tipo: "en_tienda" }
  | { tipo: "en_espera"; antes: Cosecha }
  | { tipo: "sin_fechas" }
  | { tipo: "sin_productos" }
  | { tipo: "cerrada" };

export function estadoCosecha(cosecha: Cosecha, cosechas: Cosecha[], hoy: string): EstadoCosecha {
  if (!cosecha.activa) return { tipo: "cerrada" };
  if (fechasDisponibles(cosecha.fechas, hoy).length === 0) return { tipo: "sin_fechas" };
  const vendida = cosechaEnTienda(cosechas, hoy);
  if (vendida && vendida.id !== cosecha.id) return { tipo: "en_espera", antes: vendida };
  if (productosVendibles(cosecha).length === 0) return { tipo: "sin_productos" };
  return { tipo: "en_tienda" };
}
