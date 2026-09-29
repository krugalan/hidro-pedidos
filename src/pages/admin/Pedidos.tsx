import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPeso } from "../../lib/precio";
import { useConfiguracion } from "../../hooks/useConfiguracion";
import type { Pedido, FechaEntrega } from "../../types/entities";
import styles from "./Admin.module.css";

type EstadoFiltro = "pendiente" | "entregado" | "cancelado";

const FILTROS: { key: EstadoFiltro; label: string }[] = [
  { key: "pendiente", label: "⏳ Pendientes" },
  { key: "entregado", label: "📦 Entregados" },
  { key: "cancelado", label: "❌ Cancelados" },
];

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

const fechaCorta = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EstadoFiltro>("pendiente");
  const [cambiando, setCambiando] = useState<string | null>(null);
  const { cfg } = useConfiguracion();

  // Editar fecha
  const [editFechaId, setEditFechaId] = useState<string | null>(null);
  const [fechasEdit, setFechasEdit] = useState<FechaEntrega[]>([]);
  const [fechaEditValor, setFechaEditValor] = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // Editar nota
  const [editNotaId, setEditNotaId] = useState<string | null>(null);
  const [notaEditValor, setNotaEditValor] = useState("");

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

  // ── Editar fecha ──────────────────────────────────────────────
  const abrirEditFecha = async (p: Pedido) => {
    setEditNotaId(null);
    setEditFechaId(p.id);
    setFechaEditValor(p.fecha_entrega_id ?? "");
    if (p.cosecha_id) {
      const { data } = await supabase
        .from("fechas_entrega")
        .select("*")
        .eq("cosecha_id", p.cosecha_id)
        .order("fecha");
      setFechasEdit((data ?? []) as FechaEntrega[]);
    }
  };

  const guardarFecha = async () => {
    if (!editFechaId) return;
    setGuardandoEdit(true);
    await supabase
      .from("pedidos")
      .update({ fecha_entrega_id: fechaEditValor || null })
      .eq("id", editFechaId);
    setEditFechaId(null);
    await cargar();
    setGuardandoEdit(false);
  };

  // ── Editar nota ───────────────────────────────────────────────
  const abrirEditNota = (p: Pedido) => {
    setEditFechaId(null);
    setEditNotaId(p.id);
    setNotaEditValor(p.notas ?? "");
  };

  const guardarNota = async () => {
    if (!editNotaId) return;
    setGuardandoEdit(true);
    await supabase
      .from("pedidos")
      .update({ notas: notaEditValor.trim() || null })
      .eq("id", editNotaId);
    setEditNotaId(null);
    await cargar();
    setGuardandoEdit(false);
  };

  // ── Enviar por WhatsApp ───────────────────────────────────────
  const enviarPorWhatsApp = () => {
    const texto = generarTextoExport();
    const url = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const generarTextoExport = () => {
    // Exportar pendientes + pagados (ambos necesitan ser entregados)
    const pendientes = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "pagado");
    if (pendientes.length === 0) return "No hay pedidos pendientes.";

    // Agrupar por date string para unificar pedidos de distintas cosechas en la misma fecha
    const porFecha = new Map<string, Pedido[]>();
    for (const p of pendientes) {
      const key = p.fecha?.fecha ?? "_sin_fecha";
      if (!porFecha.has(key)) porFecha.set(key, []);
      porFecha.get(key)!.push(p);
    }
    const gruposFecha = [...porFecha.entries()].sort(([a], [b]) => {
      if (a === "_sin_fecha") return 1;
      if (b === "_sin_fecha") return -1;
      return a.localeCompare(b);
    });

    const lineas: string[] = [];
    lineas.push(`📋 *Pedidos pendientes — ${pendientes.length} total*`);
    lineas.push("");

    for (const [, pedidosEnFecha] of gruposFecha) {
      const fecha = pedidosEnFecha[0]?.fecha;
      const encabezadoFecha = fecha
        ? `📅 ${fechaCorta(fecha.fecha).toUpperCase()}${fecha.hora_inicio && fecha.hora_fin ? ` · ${fecha.hora_inicio.slice(0, 5)}–${fecha.hora_fin.slice(0, 5)}` : ""}`
        : "📅 SIN FECHA";
      lineas.push(encabezadoFecha);
      lineas.push("──────────────────────────────");

      // Sub-agrupar por zona — retiro primero, luego delivery
      const porZona = new Map<string, Pedido[]>();
      for (const p of pedidosEnFecha) {
        const key = p.zona_id ?? "_sin_zona";
        if (!porZona.has(key)) porZona.set(key, []);
        porZona.get(key)!.push(p);
      }
      const gruposZona = [...porZona.entries()].sort(([, a], [, b]) => {
        const ta = a[0]?.zona?.tipo === "retiro" ? 0 : 1;
        const tb = b[0]?.zona?.tipo === "retiro" ? 0 : 1;
        if (ta !== tb) return ta - tb;
        return (a[0]?.zona?.nombre ?? "").localeCompare(b[0]?.zona?.nombre ?? "");
      });

      for (const [, pedidosEnZona] of gruposZona) {
        const zona = pedidosEnZona[0]?.zona;
        const icono = zona?.tipo === "retiro" ? "🏪" : "📍";
        lineas.push(`${icono} ${(zona?.nombre ?? "Sin zona").toUpperCase()} — ${pedidosEnZona.length} pedido${pedidosEnZona.length !== 1 ? "s" : ""}`);
        lineas.push("");

        for (const p of pedidosEnZona) {
          lineas.push(`#${p.numero} · ${p.cliente?.nombre ?? "Cliente"}`);
          if (p.tipo_entrega === "domicilio" && p.direccion_texto) {
            lineas.push(`  📍 ${p.direccion_texto}`);
          }
          if (p.items) {
            for (const item of p.items) {
              lineas.push(`  ${item.cantidad}× ${item.nombre}`);
            }
          }
          lineas.push(`  💰 ${formatPeso(p.total)}`);
          if (p.forma_pago === "transferencia") {
            lineas.push(p.estado === "pagado" ? "  🏦 Transferencia ✓ pagada" : "  🏦 Transferencia ⚠️ SIN CONFIRMAR");
          } else {
            lineas.push("  💵 Efectivo");
          }
          if (p.notas) lineas.push(`  📝 ${p.notas}`);
          lineas.push("");
        }
      }
    }

    return lineas.join("\n").trim();
  };

  // ── Agrupaciones ──────────────────────────────────────────────
  // "pendiente" agrupa también los pagados (siguen siendo pendientes de entrega)
  const filtrados = pedidos.filter((p) =>
    filtro === "pendiente" ? p.estado === "pendiente" || p.estado === "pagado" : p.estado === filtro
  );

  // Agrupar por date string (no por ID) para unificar pedidos de distintas cosechas en la misma fecha
  const porFecha = new Map<string, Pedido[]>();
  for (const p of filtrados) {
    const key = p.fecha?.fecha ?? "_sin_fecha";
    if (!porFecha.has(key)) porFecha.set(key, []);
    porFecha.get(key)!.push(p);
  }
  const gruposFecha = [...porFecha.entries()].sort(([a], [b]) => {
    if (a === "_sin_fecha") return 1;
    if (b === "_sin_fecha") return -1;
    return a.localeCompare(b);
  });

  if (loading) return <div className={styles.estado}>Cargando pedidos…</div>;

  return (
    <div className={styles.pagina}>
      <div className={styles.paginaHeaderFila}>
        <h1 className={styles.paginaTitulo}>
          Pedidos
          <span className={styles.badge}>{filtrados.length}</span>
        </h1>
        {filtro === "pendiente" && pedidos.some((p) => p.estado === "pendiente" || p.estado === "pagado") && (
          <button className={styles.btnSecundario} onClick={enviarPorWhatsApp} type="button">
            📲 Enviarme por WhatsApp
          </button>
        )}
      </div>

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

            const porZona = new Map<string, Pedido[]>();
            for (const p of pedidosEnFecha) {
              const key = p.zona_id ?? "_sin_zona";
              if (!porZona.has(key)) porZona.set(key, []);
              porZona.get(key)!.push(p);
            }
            // Retiro primero, luego delivery; alfabético dentro de cada tipo
            const gruposZona = [...porZona.entries()].sort(([, a], [, b]) => {
              const ta = a[0]?.zona?.tipo === "retiro" ? 0 : 1;
              const tb = b[0]?.zona?.tipo === "retiro" ? 0 : 1;
              if (ta !== tb) return ta - tb;
              return (a[0]?.zona?.nombre ?? "").localeCompare(b[0]?.zona?.nombre ?? "");
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

                            {/* ── Cabecera: número + badge + acciones ── */}
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
                                    {p.forma_pago === "transferencia" ? (
                                      <button
                                        className={styles.btnActiva}
                                        disabled={cambiando === p.id}
                                        onClick={() => cambiarEstado(p.id, "pagado")}
                                      >
                                        💳 Confirmar pago
                                      </button>
                                    ) : (
                                      <button
                                        className={styles.btnActiva}
                                        disabled={cambiando === p.id}
                                        onClick={() => cambiarEstado(p.id, "entregado")}
                                      >
                                        ✅ Entregado
                                      </button>
                                    )}
                                    <button
                                      className={styles.btnDanger}
                                      disabled={cambiando === p.id}
                                      onClick={() => cambiarEstado(p.id, "cancelado")}
                                    >
                                      ✗ Cancelar
                                    </button>
                                  </>
                                )}
                                {p.estado === "pagado" && (
                                  <>
                                    <button
                                      className={styles.btnActiva}
                                      disabled={cambiando === p.id}
                                      onClick={() => cambiarEstado(p.id, "entregado")}
                                    >
                                      ✅ Entregado
                                    </button>
                                    <button
                                      className={styles.btnInactiva}
                                      disabled={cambiando === p.id}
                                      onClick={() => cambiarEstado(p.id, "pendiente")}
                                    >
                                      ↩ Pendiente de pago
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

                            {/* ── Cliente ── */}
                            {p.cliente && (
                              <div className={styles.pedidoCliente}>
                                <strong>{p.cliente.nombre}</strong>
                                {p.cliente.whatsapp && <span> · {p.cliente.whatsapp}</span>}
                                {p.cliente.email && <span> · {p.cliente.email}</span>}
                              </div>
                            )}

                            {/* ── Entrega + pago ── */}
                            <div className={styles.pedidoEntrega}>
                              {p.tipo_entrega === "domicilio" ? "📍 Envío a domicilio" : "🏪 Retiro"}
                              {p.tipo_entrega === "domicilio" && p.direccion_texto && (
                                <span className={styles.pedidoDireccion}> — {p.direccion_texto}</span>
                              )}
                              {p.forma_pago === "transferencia" && (
                                <span className={styles.pedidoPago}> · 🏦 Transferencia</span>
                              )}
                              {p.forma_pago === "efectivo" && (
                                <span className={styles.pedidoPago}> · 💵 Efectivo</span>
                              )}
                            </div>

                            {/* ── Editar fecha de entrega ── */}
                            {editFechaId === p.id ? (
                              <div className={styles.editBloque}>
                                <select
                                  className={styles.input}
                                  value={fechaEditValor}
                                  onChange={(e) => setFechaEditValor(e.target.value)}
                                >
                                  <option value="">Sin fecha</option>
                                  {fechasEdit.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {fechaLarga(f.fecha)}
                                      {f.hora_inicio && f.hora_fin ? ` · ${f.hora_inicio.slice(0, 5)}–${f.hora_fin.slice(0, 5)}` : ""}
                                    </option>
                                  ))}
                                </select>
                                <div className={styles.editAcciones}>
                                  <button className={styles.btnPrimario} onClick={guardarFecha} disabled={guardandoEdit}>
                                    {guardandoEdit ? "Guardando…" : "Guardar"}
                                  </button>
                                  <button className={styles.btnSecundario} onClick={() => setEditFechaId(null)}>
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className={styles.btnEditInline}
                                onClick={() => abrirEditFecha(p)}
                                type="button"
                              >
                                📅 Cambiar fecha
                              </button>
                            )}

                            {/* ── Nota ── */}
                            {editNotaId === p.id ? (
                              <div className={styles.editBloque}>
                                <textarea
                                  className={`${styles.input} ${styles.textarea}`}
                                  value={notaEditValor}
                                  onChange={(e) => setNotaEditValor(e.target.value)}
                                  rows={2}
                                  placeholder="Escribí una nota para este pedido…"
                                  autoFocus
                                />
                                <div className={styles.editAcciones}>
                                  <button className={styles.btnPrimario} onClick={guardarNota} disabled={guardandoEdit}>
                                    {guardandoEdit ? "Guardando…" : "Guardar"}
                                  </button>
                                  <button className={styles.btnSecundario} onClick={() => setEditNotaId(null)}>
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={styles.pedidoNotaFila}>
                                {p.notas ? (
                                  <>
                                    <span className={styles.pedidoNotas}>📝 {p.notas}</span>
                                    <button className={styles.btnEditInline} onClick={() => abrirEditNota(p)} type="button">✏️</button>
                                  </>
                                ) : (
                                  <button className={styles.btnEditInline} onClick={() => abrirEditNota(p)} type="button">
                                    + Agregar nota
                                  </button>
                                )}
                              </div>
                            )}

                            {/* ── Items ── */}
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
