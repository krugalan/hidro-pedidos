import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cosecha, FechaEntrega } from "../types/entities";

export function useCosechaActiva() {
  const [cosechaActiva, setCosechaActiva] = useState<Cosecha | null>(null);
  const [proximaCosecha, setProximaCosecha] = useState<Cosecha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];

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

      // Buscar la primera cosecha activa con al menos una fecha activa >= hoy
      // Fechas en query separado: el join anidado falla silenciosamente en cold start.
      for (const c of activas) {
        const { data: fechas } = await supabase
          .from("fechas_entrega")
          .select("*")
          .eq("cosecha_id", c.id)
          .order("fecha", { ascending: true });
        const conFechas = { ...c, fechas: (fechas ?? []) as FechaEntrega[] };
        const tieneFechaFutura = (fechas ?? []).some((f) => f.activa && f.fecha >= hoy);
        if (tieneFechaFutura && !activa) {
          activa = conFechas;
        }
        // Guardar fallback con la última cosecha activa aunque no tenga fechas futuras
        if (!tieneFechaFutura && activas.indexOf(c) === activas.length - 1 && !activa) {
          activa = conFechas;
        }
      }

      // Fallback si no se encontró ninguna con fechas futuras pero hay activas
      if (!activa && activas.length > 0) {
        const ultima = activas[activas.length - 1];
        const { data: fechas } = await supabase
          .from("fechas_entrega")
          .select("*")
          .eq("cosecha_id", ultima.id)
          .order("fecha", { ascending: true });
        activa = { ...ultima, fechas: (fechas ?? []) as FechaEntrega[] };
      }

      setCosechaActiva(activa);
      setProximaCosecha(proximaRaw as Cosecha | null);
      setLoading(false);
    }

    cargar().catch(() => setLoading(false));
  }, []);

  return { cosechaActiva, proximaCosecha, loading };
}
