import { supabase } from "../../lib/supabase";
import type { Cosecha, FechaEntrega } from "../../types/entities";

export const SELECT_COSECHA =
  "*, items:cosecha_items(*, producto:productos(*)), fechas:fechas_entrega(*, zonas:fecha_entrega_zonas(*, zona:zonas(*)))";

export async function cargarCosechas(): Promise<Cosecha[]> {
  const { data, error } = await supabase
    .from("cosechas")
    .select(SELECT_COSECHA)
    .order("fecha_cosecha", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Cosecha[];
}

// ── Nombres ────────────────────────────────────────────────────

export function semanaAnio(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const semana1 = new Date(d.getFullYear(), 0, 4);
  const semana = 1 + Math.round(
    ((d.getTime() - semana1.getTime()) / 86400000 - 3 + ((semana1.getDay() + 6) % 7)) / 7
  );
  return `Semana ${semana} del ${d.getFullYear()}`;
}

/** "Semana 45 del 2026" → "Semana 45". En la base el nombre sigue completo. */
export const nombreCorto = (nombre: string) => nombre.replace(/\s+del\s+\d{4}$/, "");

// ── Fechas ─────────────────────────────────────────────────────

const aDate = (iso: string) => new Date(iso + "T00:00:00");
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "sábado 7 de noviembre" */
export const fechaLarga = (iso: string) =>
  aDate(iso)
    .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");

/** "Sábado 7 de noviembre" */
export const fechaTitulo = (iso: string) => capitalizar(fechaLarga(iso));

/** "martes 3 de noviembre de 2026" */
export const fechaConAnio = (iso: string) =>
  aDate(iso)
    .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace(",", "");

export const diaSemanaCorto = (iso: string) =>
  aDate(iso).toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");

export const numeroDia = (iso: string) => aDate(iso).getDate();

export function sumarDias(iso: string, dias: number): string {
  const d = aDate(iso);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export const diferenciaDias = (desde: string, hasta: string) =>
  Math.round((Date.parse(hasta + "T00:00:00Z") - Date.parse(desde + "T00:00:00Z")) / 86400000);

export const ordenarFechas = (fechas: FechaEntrega[] | undefined) =>
  [...(fechas ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha));

// ── Textos ─────────────────────────────────────────────────────

export const plural = (n: number, singular: string, varios: string) =>
  `${n} ${n === 1 ? singular : varios}`;

/** "2 zonas de delivery · 1 punto de retiro" */
export function resumenPuntos(fecha: FechaEntrega): string {
  const zonas = fecha.zonas ?? [];
  const delivery = zonas.filter((z) => z.zona?.tipo === "delivery").length;
  const retiro = zonas.filter((z) => z.zona?.tipo === "retiro").length;
  const partes = [
    delivery > 0 ? plural(delivery, "zona de delivery", "zonas de delivery") : "",
    retiro > 0 ? plural(retiro, "punto de retiro", "puntos de retiro") : "",
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(" · ") : "Sin zonas ni puntos de retiro";
}

export type EstadoFecha = "recibe" | "falta" | "cerrada" | "pasada";

export function estadoFecha(fecha: FechaEntrega, hoy: string): EstadoFecha {
  if (fecha.fecha < hoy) return "pasada";
  if (!fecha.activa) return "cerrada";
  return (fecha.zonas?.length ?? 0) > 0 ? "recibe" : "falta";
}
