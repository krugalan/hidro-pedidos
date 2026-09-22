import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Pedido } from "../../types/entities";
import styles from "./Admin.module.css";

const ESTADOS = ["pendiente", "confirmado", "entregado", "cancelado"] as const;

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "⏳ Pendiente",
  confirmado: "✅ Confirmado",
  entregado: "📦 Entregado",
  cancelado: "❌ Cancelado",
};

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(monto);

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pedidos")
      .select("*, items:pedido_items(*), cliente:clientes(nombre, whatsapp, email)")
      .order("numero", { ascending: false });
    setPedidos((data ?? []) as Pedido[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    cargar();
  };

  const pedidosFiltrados = filtroEstado === "todos"
    ? pedidos
    : pedidos.filter((p) => p.estado === filtroEstado);

  if (loading) return <div className={styles.estado}>Cargando pedidos…</div>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Pedidos</h1>

      <div className={styles.filtros}>
        {["todos", ...ESTADOS].map((e) => (
          <button
            key={e}
            className={`${styles.filtroBtn} ${filtroEstado === e ? styles.filtroActivo : ""}`}
            onClick={() => setFiltroEstado(e)}
          >
            {e === "todos" ? "Todos" : ESTADO_LABEL[e]}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <p className={styles.estado}>No hay pedidos.</p>
      ) : (
        <div className={styles.pedidosList}>
          {pedidosFiltrados.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.pedidoHeader}>
                <div>
                  <span className={styles.pedidoNumero}>#{p.numero}</span>
                  <span className={styles.pedidoFecha}>{formatFecha(p.created_at)}</span>
                </div>
                <select
                  className={styles.selectEstado}
                  value={p.estado}
                  onChange={(e) => cambiarEstado(p.id, e.target.value)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                  ))}
                </select>
              </div>

              {p.cliente && (
                <div className={styles.pedidoCliente}>
                  <strong>{p.cliente.nombre}</strong>
                  {p.cliente.whatsapp && <span> · {p.cliente.whatsapp}</span>}
                  {p.cliente.email && <span> · {p.cliente.email}</span>}
                </div>
              )}

              <div className={styles.pedidoEntrega}>
                {p.tipo_entrega === "domicilio" ? "📍 Envío a domicilio" : "🏥 Retiro en zona hospital"}
              </div>

              {p.items && p.items.length > 0 && (
                <ul className={styles.pedidoItems}>
                  {p.items.map((item) => (
                    <li key={item.id} className={styles.pedidoItem}>
                      <span>{item.cantidad} × {item.nombre}</span>
                      <span>{formatPeso(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.pedidoTotal}>
                <span>Total</span>
                <strong>{formatPeso(p.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
