import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cosecha } from "../types/entities";

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
    ]).then(([{ data: activa }, { data: proxima }]) => {
      setCosechaActiva(activa as Cosecha | null);
      setProximaCosecha(proxima as Cosecha | null);
      setLoading(false);
    });
  }, []);

  return { cosechaActiva, proximaCosecha, loading };
}
