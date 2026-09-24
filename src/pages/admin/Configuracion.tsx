import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Zona } from "../../types/entities";
import config from "../../config";
import styles from "./Admin.module.css";

export function Configuracion() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [nuevaZona, setNuevaZona] = useState("");
  const [tipoNuevaZona, setTipoNuevaZona] = useState<"delivery" | "retiro">("delivery");
  const [error, setError] = useState("");

  const [whatsapp, setWhatsapp] = useState(config.whatsapp);
  const [editandoWa, setEditandoWa] = useState(false);
  const [waInput, setWaInput] = useState("");
  const [guardandoWa, setGuardandoWa] = useState(false);
  const [waOk, setWaOk] = useState(false);

  const cargarZonas = async () => {
    const { data } = await supabase.from("zonas").select("*").order("nombre");
    setZonas((data ?? []) as Zona[]);
    setLoadingZonas(false);
  };

  useEffect(() => {
    cargarZonas();
    supabase
      .from("configuracion")
      .select("value")
      .eq("key", "whatsapp")
      .maybeSingle()
      .then(({ data }) => { if (data?.value) setWhatsapp(data.value); });
  }, []);

  const crearZona = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: err } = await supabase
      .from("zonas")
      .insert({ nombre: nuevaZona.trim(), tipo: tipoNuevaZona });
    if (err) setError(err.message);
    else { setNuevaZona(""); cargarZonas(); }
  };

  const eliminarZona = async (id: string) => {
    await supabase.from("zonas").delete().eq("id", id);
    cargarZonas();
  };

  const toggleTipoZona = async (zona: Zona) => {
    const nuevo = zona.tipo === "delivery" ? "retiro" : "delivery";
    await supabase.from("zonas").update({ tipo: nuevo }).eq("id", zona.id);
    cargarZonas();
  };

  const guardarWa = async () => {
    setGuardandoWa(true);
    const { error: err } = await supabase
      .from("configuracion")
      .upsert({ key: "whatsapp", value: waInput.trim() });
    if (!err) {
      setWhatsapp(waInput.trim());
      setEditandoWa(false);
      setWaOk(true);
      setTimeout(() => setWaOk(false), 2500);
    }
    setGuardandoWa(false);
  };

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Configuración</h1>

      {/* WhatsApp */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>WhatsApp de pedidos</h2>
        <p className={styles.ayuda}>
          Número al que llegan los pedidos de los clientes (formato: 549 + código de área sin 0 + número sin 15).
        </p>
        {editandoWa ? (
          <div className={styles.formInline} style={{ marginTop: "0.75rem" }}>
            <input
              type="text"
              className={styles.input}
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              placeholder="5491138860680"
              autoFocus
            />
            <button className={styles.btnPrimario} onClick={guardarWa} disabled={guardandoWa}>
              {guardandoWa ? "Guardando…" : "Guardar"}
            </button>
            <button className={styles.btnSecundario} onClick={() => setEditandoWa(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
            <code style={{ background: "#f3f4f6", padding: "0.375rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.9rem", fontFamily: "monospace" }}>
              {whatsapp}
            </code>
            <button
              className={styles.btnSecundario}
              onClick={() => { setWaInput(whatsapp); setEditandoWa(true); }}
            >
              Editar
            </button>
            {waOk && (
              <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>✓ Guardado</span>
            )}
          </div>
        )}
      </section>

      {/* Zonas */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Zonas de entrega</h2>

        <form onSubmit={crearZona} className={styles.formInline}>
          <input
            type="text"
            className={styles.input}
            value={nuevaZona}
            onChange={(e) => setNuevaZona(e.target.value)}
            required
            placeholder="Nombre de zona (Ej: Centro)"
          />
          <select
            className={styles.inputPeque}
            value={tipoNuevaZona}
            onChange={(e) => setTipoNuevaZona(e.target.value as "delivery" | "retiro")}
          >
            <option value="delivery">Delivery</option>
            <option value="retiro">Retiro</option>
          </select>
          <button type="submit" className={styles.btnPrimario}>Agregar</button>
        </form>
        {error && <p className={styles.errorMsg}>{error}</p>}

        {loadingZonas ? (
          <p className={styles.estado}>Cargando…</p>
        ) : (
          <ul className={styles.zonasList}>
            {zonas.map((z) => (
              <li key={z.id} className={styles.zonaItem}>
                <span>{z.nombre}</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    className={z.tipo === "retiro" ? styles.btnInactiva : styles.btnActiva}
                    onClick={() => toggleTipoZona(z)}
                    title="Cambiar tipo"
                  >
                    {z.tipo === "retiro" ? "🏠 Retiro" : "🚚 Delivery"}
                  </button>
                  <button className={styles.btnDanger} onClick={() => eliminarZona(z.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
