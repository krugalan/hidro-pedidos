import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import config from "../config";

export interface AppConfiguracion {
  whatsapp: string;
  whatsapp2: string;
}

export function useConfiguracion() {
  const [cfg, setCfg] = useState<AppConfiguracion>({ whatsapp: config.whatsapp, whatsapp2: "" });

  useEffect(() => {
    supabase
      .from("configuracion")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(
          (data as { key: string; value: string }[]).map((r) => [r.key, r.value])
        );
        setCfg((prev) => ({
          ...prev,
          ...(map["whatsapp"] ? { whatsapp: map["whatsapp"] } : {}),
          ...(map["whatsapp2"] ? { whatsapp2: map["whatsapp2"] } : {}),
        }));
      });
  }, []);

  return { cfg };
}
