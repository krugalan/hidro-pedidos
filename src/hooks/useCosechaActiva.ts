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
      // Queries paralelas: cosecha activa (con items) y próxima cosecha
      const [{ data: activaRaw }, { data: proximaRaw }] = await Promise.all([
        supabase
          .from("cosechas")
          .select("*, items:cosecha_items(*, producto:productos(*))")
          .eq("activa", true)
          .order("fecha_cosecha", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("cosechas")
          .select("*")
          .eq("activa", false)
          .gte("fecha_cosecha", hoy)
          .order("fecha_cosecha", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      let activa = activaRaw as Cosecha | null;

      // Fechas siempre en query separado: el join anidado falla silenciosamente
      // en el primer request (cold start de PostgREST / Supabase free tier).
      if (activa) {
        const { data: fechas } = await supabase
          .from("fechas_entrega")
          .select("*")
          .eq("cosecha_id", activa.id)
          .order("fecha", { ascending: true });
        activa = { ...activa, fechas: (fechas ?? []) as FechaEntrega[] };
      }

      setCosechaActiva(activa);
      setProximaCosecha(proximaRaw as Cosecha | null);
      setLoading(false);
    }

    cargar().catch(() => setLoading(false));
  }, []);

  return { cosechaActiva, proximaCosecha, loading };
}
