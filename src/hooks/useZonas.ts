import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Zona } from "../types/entities";

export function useZonas() {
  const [zonas, setZonas] = useState<Zona[]>([]);

  useEffect(() => {
    supabase
      .from("zonas")
      .select("*")
      .order("nombre")
      .then(({ data }) => setZonas((data ?? []) as Zona[]));
  }, []);

  return { zonas };
}
