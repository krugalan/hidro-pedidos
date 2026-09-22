import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Cosecha, FechaEntrega, Producto } from "../../types/entities";
import styles from "./Admin.module.css";

function semanaAnio(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const semana1 = new Date(d.getFullYear(), 0, 4);
  const semana = 1 + Math.round(
    ((d.getTime() - semana1.getTime()) / 86400000 - 3 + ((semana1.getDay() + 6) % 7)) / 7
  );
  return `Semana ${semana} del ${d.getFullYear()}`;
}

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

const fechaCorta = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

export function Cosechas() {
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [todosProductos, setTodosProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fechaCosecha, setFechaCosecha] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const [{ data: cos }, { data: prods }] = await Promise.all([
      supabase
        .from("cosechas")
        .select("*, items:cosecha_items(*, producto:productos(*)), fechas:fechas_entrega(*)")
        .order("fecha_cosecha", { ascending: false }),
      supabase.from("productos").select("*").eq("activo", true).order("nombre"),
    ]);
    setCosechas((cos ?? []) as Cosecha[]);
    setTodosProductos((prods ?? []) as Producto[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crearCosecha = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const { data: cosecha, error: err } = await supabase
      .from("cosechas")
      .insert({ nombre: semanaAnio(fechaCosecha), fecha_cosecha: fechaCosecha, activa: true })
      .select()
      .single();

    if (err || !cosecha) { setError(err?.message ?? "Error al crear."); setGuardando(false); return; }

    if (fechaEntrega) {
      await supabase.from("fechas_entrega").insert({ cosecha_id: cosecha.id, fecha: fechaEntrega, activa: true });
    }

    setFechaCosecha(""); setFechaEntrega("");
    setGuardando(false);
    cargar();
  };

  const eliminarCosecha = async (cosecha: Cosecha) => {
    // Verificar si hay pedidos activos (pendientes o entregados)
    const { count: activos } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("cosecha_id", cosecha.id)
      .in("estado", ["pendiente", "entregado"]);

    if ((activos ?? 0) > 0) {
      setError(`"${cosecha.nombre}" tiene pedidos activos y no puede eliminarse.`);
      return;
    }

    // Obtener IDs de pedidos cancelados para borrarlos en cascada
    const { data: cancelados } = await supabase
      .from("pedidos")
      .select("id")
      .eq("cosecha_id", cosecha.id)
      .eq("estado", "cancelado");

    if (cancelados?.length) {
      const ids = cancelados.map((p) => p.id);
      await supabase.from("pedido_items").delete().in("pedido_id", ids);
      await supabase.from("pedidos").delete().in("id", ids);
    }

    await supabase.from("cosechas").delete().eq("id", cosecha.id);
    cargar();
  };

  const toggleActiva = async (cosecha: Cosecha) => {
    await supabase.from("cosechas").update({ activa: !cosecha.activa }).eq("id", cosecha.id);
    cargar();
  };

  const toggleProducto = async (cosecha: Cosecha, productoId: string) => {
    const existente = cosecha.items?.find((i) => i.producto_id === productoId);
    if (existente) {
      await supabase.from("cosecha_items").delete().eq("id", existente.id);
    } else {
      await supabase.from("cosecha_items").insert({ cosecha_id: cosecha.id, producto_id: productoId });
    }
    cargar();
  };

  const agregarFecha = async (cosechaId: string, fechaNueva: string, fechasExistentes: FechaEntrega[]) => {
    if (!fechaNueva) return;
    if (fechasExistentes.some((f) => f.fecha === fechaNueva)) {
      setError("Esa fecha de entrega ya existe en esta cosecha.");
      return;
    }
    await supabase.from("fechas_entrega").insert({ cosecha_id: cosechaId, fecha: fechaNueva, activa: true });
    cargar();
  };

  const eliminarFecha = async (id: string) => {
    await supabase.from("fechas_entrega").delete().eq("id", id);
    cargar();
  };

  const toggleFecha = async (fecha: FechaEntrega) => {
    await supabase.from("fechas_entrega").update({ activa: !fecha.activa }).eq("id", fecha.id);
    cargar();
  };

  if (loading) return <div className={styles.estado}>Cargando cosechas…</div>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Cosechas</h1>

      {error && <p className={styles.errorMsg} style={{ marginBottom: "1rem" }}>{error}</p>}

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Nueva cosecha</h2>
        <form onSubmit={crearCosecha} className={styles.form}>
          <div className={styles.formFila}>
            <div className={styles.campo}>
              <label className={styles.label}>Fecha de cosecha</label>
              <input type="date" className={styles.input} value={fechaCosecha} onChange={(e) => setFechaCosecha(e.target.value)} required />
              {fechaCosecha && <span className={styles.ayuda}>{semanaAnio(fechaCosecha)}</span>}
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Fecha de entrega <span className={styles.opcional}>(opcional)</span></label>
              <input type="date" className={styles.input} value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
            </div>
          </div>
          <button type="submit" className={styles.btnPrimario} disabled={guardando || !fechaCosecha}>
            {guardando ? "Guardando…" : "Crear cosecha"}
          </button>
        </form>
      </section>

      <section>
        {cosechas.length === 0 ? (
          <p className={styles.estado}>No hay cosechas todavía.</p>
        ) : (
          cosechas.map((c) => (
            <CosechaCard
              key={c.id}
              cosecha={c}
              todosProductos={todosProductos}
              onToggleActiva={() => toggleActiva(c)}
              onEliminar={() => eliminarCosecha(c)}
              onToggleProducto={(pid) => toggleProducto(c, pid)}
              onAgregarFecha={(f) => agregarFecha(c.id, f, c.fechas ?? [])}
              onEliminarFecha={eliminarFecha}
              onToggleFecha={toggleFecha}
            />
          ))
        )}
      </section>
    </div>
  );
}

function CosechaCard({
  cosecha, todosProductos,
  onToggleActiva, onEliminar, onToggleProducto,
  onAgregarFecha, onEliminarFecha, onToggleFecha,
}: {
  cosecha: Cosecha;
  todosProductos: Producto[];
  onToggleActiva: () => void;
  onEliminar: () => void;
  onToggleProducto: (id: string) => void;
  onAgregarFecha: (fecha: string) => void;
  onEliminarFecha: (id: string) => void;
  onToggleFecha: (f: FechaEntrega) => void;
}) {
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const productosEnCosecha = new Set(cosecha.items?.map((i) => i.producto_id) ?? []);

  const handleAgregarFecha = () => { if (nuevaFecha) { onAgregarFecha(nuevaFecha); setNuevaFecha(""); } };

  return (
    <div className={`${styles.card} ${!cosecha.activa ? styles.cardInactiva : ""}`}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3 className={styles.cosechaNombre}>{cosecha.nombre}</h3>
          <p className={styles.cosechaDesc}>Cosecha: {fechaCorta(cosecha.fecha_cosecha)}</p>
        </div>
        <div className={styles.cosechaAcciones}>
          <button
            className={cosecha.activa ? styles.btnActiva : styles.btnInactiva}
            onClick={onToggleActiva}
          >
            {cosecha.activa ? "Abierta" : "Cerrada"}
          </button>
          {!confirmDelete ? (
            <button className={styles.btnDanger} onClick={() => setConfirmDelete(true)}>Eliminar</button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmTxt}>¿Seguro?</span>
              <button className={styles.btnDanger} onClick={() => { onEliminar(); setConfirmDelete(false); }}>Sí</button>
              <button className={styles.btnSecundario} onClick={() => setConfirmDelete(false)}>No</button>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className={styles.fechasBloque}>
        <p className={styles.fechasLabel}>Productos de esta cosecha</p>
        {todosProductos.length === 0 ? (
          <p className={styles.sinFechas}>No hay productos activos. Creá productos en la sección Productos.</p>
        ) : (
          <div className={styles.productosCheckGrid}>
            {todosProductos.map((p) => (
              <label key={p.id} className={`${styles.productoCheck} ${productosEnCosecha.has(p.id) ? styles.productoCheckActivo : ""}`}>
                <input
                  type="checkbox"
                  checked={productosEnCosecha.has(p.id)}
                  onChange={() => onToggleProducto(p.id)}
                  className={styles.radioOculto}
                />
                <span>{p.emoji} {p.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Fechas de entrega */}
      <div className={styles.fechasBloque}>
        <p className={styles.fechasLabel}>Fechas de entrega</p>
        {cosecha.fechas && cosecha.fechas.length > 0 ? (
          <ul className={styles.fechasList}>
            {cosecha.fechas
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map((f) => (
                <li key={f.id} className={`${styles.fechaItem} ${!f.activa ? styles.fechaInactiva : ""}`}>
                  <span>{fechaLarga(f.fecha)}</span>
                  <div className={styles.fechaAcciones}>
                    <button className={styles.btnFechaToogle} onClick={() => onToggleFecha(f)}>
                      {f.activa ? "Desactivar" : "Activar"}
                    </button>
                    <button className={styles.btnDanger} onClick={() => onEliminarFecha(f.id)}>✕</button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className={styles.sinFechas}>Sin fechas de entrega.</p>
        )}

        <div className={styles.agregarFechaFila}>
          <input type="date" className={styles.inputPeque} value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
          <button className={styles.btnSecundario} onClick={handleAgregarFecha} disabled={!nuevaFecha}>Agregar fecha</button>
        </div>
      </div>
    </div>
  );
}
