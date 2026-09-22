import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Pedido } from "../../types/entities";
import styles from "./Admin.module.css";

type EstadoFiltro = "pendiente" | "entregado" | "cancelado";

const FILTROS: { key: EstadoFiltro; label: string }[] = [
  { key: "pendiente", label: "⏳ Pendientes" },
  { key: "entregado", label: "📦 Entregados" },
  { key: "cancelado", label: "❌ Cancelados" },
];

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(monto);

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EstadoFiltro>("pendiente");
  const [cambiando, setCambiando] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pedidos")
      .select(
        "*, items:pedido_items(*), cliente:clientes(nombre,whatsapp,email), zona:zonas(id,nombre,tipo), fecha:fechas_entrega(id,fecha,hora_inicio,hora_fin)"
      )
      .order("numero", { ascending: true });
    setPedidos((data ?? []) as Pedido[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    setCambiando(id);
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    await cargar();
    setCambiando(null);
  };

  // Filtrar por estado
  const filtrados = pedidos.filter((p) => p.estado === filtro);

  // Agrupar por fecha_entrega_id, ordenadas por fecha ASC (sin fecha al final)
  const porFecha = new Map<string, Pedido[]>();
  for (const p of filtrados) {
    const key = p.fecha_entrega_id ?? "_sin_fecha";
    if (!porFecha.has(key)) porFecha.set(key, []);
    porFecha.get(key)!.push(p);
  }

  const gruposFecha = [...porFecha.entries()].sort(([, a], [, b]) => {
    const fa = a[0]?.fecha?.fecha ?? "9999-99-99";
    const fb = b[0]?.fecha?.fecha ?? "9999-99-99";
    return fa.localeCompare(fb);
  });

  if (loading) return <div className={styles.estado}>Cargando pedidos…</div>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>
        Pedidos
        <span className={styles.badge}>{filtrados.length}</span>
      </h1>

      <div className={styles.filtros}>
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.filtroBtn} ${filtro === key ? styles.filtroActivo : ""}`}
            onClick={() => setFiltro(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p className={styles.estado}>No hay pedidos en este estado.</p>
      ) : (
        <div>
          {gruposFecha.map(([fechaKey, pedidosEnFecha]) => {
            const fecha = pedidosEnFecha[0]?.fecha;

            // Sub-agrupar por zona dentro de cada fecha
            const porZona = new Map<string, Pedido[]>();
            for (const p of pedidosEnFecha) {
              const key = p.zona_id ?? "_sin_zona";
              if (!porZona.has(key)) porZona.set(key, []);
              porZona.get(key)!.push(p);
            }

            const gruposZona = [...porZona.entries()].sort(([, a], [, b]) => {
              const za = a[0]?.zona?.nombre ?? "ZZZZ";
              const zb = b[0]?.zona?.nombre ?? "ZZZZ";
              return za.localeCompare(zb);
            });

            return (
              <section key={fechaKey} className={styles.grupoFecha}>
                <div className={styles.grupoFechaHeader}>
                  <span>
                    📅 {fecha ? fechaLarga(fecha.fecha) : "Sin fecha asignada"}
                    {fecha?.hora_inicio && fecha?.hora_fin && (
                      <span className={styles.grupoFechaHora}>
                        {" "}· {fecha.hora_inicio.slice(0, 5)}–{fecha.hora_fin.slice(0, 5)}
                      </span>
                    )}
                  </span>
                  <span className={styles.grupoCount}>{pedidosEnFecha.length} pedidos</span>
                </div>

                {gruposZona.map(([zonaKey, pedidosEnZona]) => {
                  const zona = pedidosEnZona[0]?.zona;
                  return (
                    <div key={zonaKey} className={styles.grupoZona}>
                      <div className={styles.grupoZonaHeader}>
                        <span>
                          {zona?.tipo === "retiro" ? "🏪" : "📍"}{" "}
                          {zona?.nombre ?? "Sin zona asignada"}
                        </span>
                        <span className={styles.grupoCount}>{pedidosEnZona.length}</span>
                      </div>

                      <div className={styles.pedidosList}>
                        {pedidosEnZona.map((p) => (
                          <div key={p.id} className={styles.card}>
                            <div className={styles.pedidoHeader}>
                              <div>
                                <span className={styles.pedidoNumero}>#{p.numero}</span>
                                <span className={`${styles.estadoBadge} ${styles[`estado_${p.estado}`]}`}>
                                  {p.estado}
                                </span>
                              </div>
                              <div className={styles.estadoAcciones}>
                                {p.estado === "pendiente" && (
                                  <>
                                    <button
                                      className={styles.btnActiva}
                                      disabled={cambiando === p.id}
                                      onClick={() => cambiarEstado(p.id, "entregado")}
                                    >
                                      ✅ Entregado
                                    </button>
                                    <button
                                      className={styles.btnDanger}
                                      disabled={cambiando === p.id}
                                      onClick={() => cambiarEstado(p.id, "cancelado")}
                                    >
                                      ✗ Cancelar
                                    </button>
                                  </>
                                )}
                                {(p.estado === "entregado" || p.estado === "cancelado") && (
                                  <button
                                    className={styles.btnInactiva}
                                    disabled={cambiando === p.id}
                                    onClick={() => cambiarEstado(p.id, "pendiente")}
                                  >
                                    ↩ Pendiente
                                  </button>
                                )}
                              </div>
                            </div>

                            {p.cliente && (
                              <div className={styles.pedidoCliente}>
                                <strong>{p.cliente.nombre}</strong>
                                {p.cliente.whatsapp && <span> · {p.cliente.whatsapp}</span>}
                                {p.cliente.email && <span> · {p.cliente.email}</span>}
                              </div>
                            )}

                            <div className={styles.pedidoEntrega}>
                              {p.tipo_entrega === "domicilio" ? "📍 Envío a domicilio" : "🏪 Retiro"}
                              {p.tipo_entrega === "domicilio" && p.direccion_texto && (
                                <span className={styles.pedidoDireccion}> — {p.direccion_texto}</span>
                              )}
                            </div>

                            {p.notas && (
                              <div className={styles.pedidoNotas}>📝 {p.notas}</div>
                            )}

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
                              <span>{p.tipo_entrega === "domicilio" ? "Total con envío" : "Total"}</span>
                              <strong>{formatPeso(p.total)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
