import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cosecha, FechaEntrega } from "../types/entities";

export function useCosechaActiva() {
  const [cosechaActiva, setCosechaActiva] = useState<Cosecha | null>(null);
  const [proximaCosecha, setProximaCosecha] = useState<Cosecha | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase
        .from("cosechas")
        .select("*, items:cosecha_items(*, producto:productos(*)), fechas:fechas_entrega(*)")
        .eq("activa", true)
        .order("fecha_cosecha", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("cosechas")
        .select("*, fechas:fechas_entrega(*)")
        .eq("activa", false)
        .gte("fecha_cosecha", hoy)
        .order("fecha_cosecha", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])
      .then(async ([{ data: activaRaw }, { data: proxima }]) => {
        let activa = activaRaw as Cosecha | null;

        // Si la cosecha cargó pero el join de fechas no trajo datos (puede pasar
        // en el primer request tras un cold start de Supabase), los buscamos aparte.
        if (activa && !activa.fechas?.length) {
          const { data: fechas } = await supabase
            .from("fechas_entrega")
            .select("*")
            .eq("cosecha_id", activa.id)
            .order("fecha", { ascending: true });
          if (fechas?.length) {
            activa = { ...activa, fechas: fechas as FechaEntrega[] };
          }
        }

        setCosechaActiva(activa);
        setProximaCosecha(proxima as Cosecha | null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { cosechaActiva, proximaCosecha, loading };
}
