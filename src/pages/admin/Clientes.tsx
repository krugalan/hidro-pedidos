import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Cliente } from "../../types/entities";
import styles from "./Admin.module.css";

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClientes((data ?? []) as Cliente[]);
        setLoading(false);
      });
  }, []);

  const filtrados = clientes.filter((c) =>
    busqueda === "" ||
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.whatsapp ?? "").includes(busqueda)
  );

  if (loading) return <div className={styles.estado}>Cargando clientes…</div>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Clientes <span className={styles.badge}>{clientes.length}</span></h1>

      <div className={styles.campo}>
        <input
          type="text"
          className={styles.input}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o WhatsApp…"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className={styles.estado}>No hay clientes todavía.</p>
      ) : (
        <div className={styles.tabla}>
          <div className={styles.tablaHeader}>
            <span>Nombre</span>
            <span>WhatsApp</span>
            <span>Email</span>
            <span>Registro</span>
          </div>
          {filtrados.map((c) => (
            <div key={c.id} className={styles.tablaFila}>
              <span className={styles.tablaCliente}>{c.nombre}</span>
              <span>{c.whatsapp ?? "—"}</span>
              <span>{c.email ?? "—"}</span>
              <span className={styles.tablaSec}>{formatFecha(c.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
