import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Cosecha, FechaEntrega } from "../../types/entities";
import styles from "./Admin.module.css";

const fechaLocal = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

export function Cosechas() {
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form nueva cosecha
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("cosechas")
      .select("*, fechas:fechas_entrega(*)")
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setCosechas((data ?? []) as Cosecha[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crearCosecha = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const { data: cosecha, error: errCosecha } = await supabase
      .from("cosechas")
      .insert({ nombre: nombre.trim(), descripcion: descripcion.trim() || null, activa: true })
      .select()
      .single();

    if (errCosecha || !cosecha) {
      setError(errCosecha?.message ?? "Error al crear cosecha.");
      setGuardando(false);
      return;
    }

    if (fecha) {
      await supabase.from("fechas_entrega").insert({
        cosecha_id: cosecha.id,
        fecha,
        activa: true,
      });
    }

    setNombre("");
    setDescripcion("");
    setFecha("");
    setGuardando(false);
    cargar();
  };

  const toggleActiva = async (cosecha: Cosecha) => {
    await supabase
      .from("cosechas")
      .update({ activa: !cosecha.activa })
      .eq("id", cosecha.id);
    cargar();
  };

  const agregarFecha = async (cosechaId: string, fechaNueva: string) => {
    if (!fechaNueva) return;
    await supabase.from("fechas_entrega").insert({
      cosecha_id: cosechaId,
      fecha: fechaNueva,
      activa: true,
    });
    cargar();
  };

  const toggleFecha = async (fecha: FechaEntrega) => {
    await supabase
      .from("fechas_entrega")
      .update({ activa: !fecha.activa })
      .eq("id", fecha.id);
    cargar();
  };

  if (loading) return <div className={styles.estado}>Cargando cosechas…</div>;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Cosechas</h1>

      {/* Formulario nueva cosecha */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Nueva cosecha</h2>
        <form onSubmit={crearCosecha} className={styles.form}>
          <div className={styles.formFila}>
            <div className={styles.campo}>
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                className={styles.input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej: Cosecha Semana 38"
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Fecha de entrega</label>
              <input
                type="date"
                className={styles.input}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>Descripción <span className={styles.opcional}>(opcional)</span></label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Qué incluye esta cosecha…"
            />
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button type="submit" className={styles.btnPrimario} disabled={guardando}>
            {guardando ? "Guardando…" : "Crear cosecha"}
          </button>
        </form>
      </section>

      {/* Lista cosechas */}
      <section>
        {cosechas.length === 0 ? (
          <p className={styles.estado}>No hay cosechas todavía.</p>
        ) : (
          cosechas.map((c) => (
            <CosechaCard
              key={c.id}
              cosecha={c}
              onToggleActiva={() => toggleActiva(c)}
              onAgregarFecha={(f) => agregarFecha(c.id, f)}
              onToggleFecha={toggleFecha}
            />
          ))
        )}
      </section>
    </div>
  );
}

function CosechaCard({
  cosecha,
  onToggleActiva,
  onAgregarFecha,
  onToggleFecha,
}: {
  cosecha: Cosecha;
  onToggleActiva: () => void;
  onAgregarFecha: (fecha: string) => void;
  onToggleFecha: (f: FechaEntrega) => void;
}) {
  const [nuevaFecha, setNuevaFecha] = useState("");

  const handleAgregarFecha = () => {
    if (nuevaFecha) {
      onAgregarFecha(nuevaFecha);
      setNuevaFecha("");
    }
  };

  return (
    <div className={`${styles.card} ${!cosecha.activa ? styles.cardInactiva : ""}`}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3 className={styles.cosechaNombre}>{cosecha.nombre}</h3>
          {cosecha.descripcion && (
            <p className={styles.cosechaDesc}>{cosecha.descripcion}</p>
          )}
        </div>
        <button
          className={cosecha.activa ? styles.btnActiva : styles.btnInactiva}
          onClick={onToggleActiva}
        >
          {cosecha.activa ? "Activa" : "Inactiva"}
        </button>
      </div>

      {/* Fechas de entrega */}
      <div className={styles.fechasBloque}>
        <p className={styles.fechasLabel}>Fechas de entrega</p>
        {cosecha.fechas && cosecha.fechas.length > 0 ? (
          <ul className={styles.fechasList}>
            {cosecha.fechas.map((f) => (
              <li key={f.id} className={`${styles.fechaItem} ${!f.activa ? styles.fechaInactiva : ""}`}>
                <span>{fechaLocal(f.fecha)}</span>
                <button className={styles.btnFechaToogle} onClick={() => onToggleFecha(f)}>
                  {f.activa ? "Desactivar" : "Activar"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.sinFechas}>Sin fechas de entrega.</p>
        )}

        <div className={styles.agregarFechaFila}>
          <input
            type="date"
            className={styles.inputPeque}
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
          />
          <button className={styles.btnSecundario} onClick={handleAgregarFecha} disabled={!nuevaFecha}>
            Agregar fecha
          </button>
        </div>
      </div>
    </div>
  );
}
