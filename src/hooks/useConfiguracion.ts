import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import config from "../config";

export interface AppConfiguracion {
  whatsapp: string;
}

export function useConfiguracion() {
  const [cfg, setCfg] = useState<AppConfiguracion>({ whatsapp: config.whatsapp });

  useEffect(() => {
    supabase
      .from("configuracion")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(
          (data as { key: string; value: string }[]).map((r) => [r.key, r.value])
        );
        if (map["whatsapp"]) setCfg((prev) => ({ ...prev, whatsapp: map["whatsapp"] }));
      });
  }, []);

  return { cfg };
}
