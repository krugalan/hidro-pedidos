import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { AdminLogin } from "./AdminLogin";
import { AdminLayout } from "./AdminLayout";
import { Cosechas } from "./Cosechas";
import { Pedidos } from "./Pedidos";
import { Clientes } from "./Clientes";
import { Configuracion } from "./Configuracion";
import type { User } from "@supabase/supabase-js";

export function AdminApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>Cargando…</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout user={user} />}>
        <Route index element={<Navigate to="cosechas" replace />} />
        <Route path="cosechas" element={<Cosechas />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="cosechas" replace />} />
      </Route>
    </Routes>
  );
}
