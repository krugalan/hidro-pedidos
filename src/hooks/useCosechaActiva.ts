import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fechasDisponibles, hoyIso } from "../lib/disponibilidad";
import type { Cosecha, FechaEntrega } from "../types/entities";

export function useCosechaActiva() {
  const [cosechaActiva, setCosechaActiva] = useState<Cosecha | null>(null);
  const [proximaCosecha, setProximaCosecha] = useState<Cosecha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = hoyIso();

    async function cargar() {
      // Cargar todas las cosechas activas (ASC) + próxima inactiva en paralelo
      const [{ data: activasRaw }, { data: proximaRaw }] = await Promise.all([
        supabase
          .from("cosechas")
          .select("*, items:cosecha_items(*, producto:productos(*))")
          .eq("activa", true)
          .order("fecha_cosecha", { ascending: true }),
        supabase
          .from("cosechas")
          .select("*")
          .eq("activa", false)
          .gte("fecha_cosecha", hoy)
          .order("fecha_cosecha", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      const activas = (activasRaw ?? []) as Cosecha[];
      let activa: Cosecha | null = null;

      // Buscar la primera cosecha activa con al menos una fecha disponible
      // (abierta, actual o futura y con algún punto de entrega).
      // Una cosecha activa sin fechas disponibles se trata como cerrada.
      // Fechas en query separado: el join anidado falla silenciosamente en cold start.
      for (const c of activas) {
        const { data } = await supabase
          .from("fechas_entrega")
          .select("*, zonas:fecha_entrega_zonas(*, zona:zonas(*))")
          .eq("cosecha_id", c.id)
          .order("fecha", { ascending: true });
        const fechas = (data ?? []) as FechaEntrega[];
        if (fechasDisponibles(fechas, hoy).length > 0) {
          activa = { ...c, fechas };
          break;
        }
      }

      setCosechaActiva(activa);
      setProximaCosecha(proximaRaw as Cosecha | null);
      setLoading(false);
    }

    cargar().catch(() => setLoading(false));
  }, []);

  return { cosechaActiva, proximaCosecha, loading };
}
