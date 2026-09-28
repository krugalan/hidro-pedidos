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
  const [waError, setWaError] = useState("");

  const [whatsapp2, setWhatsapp2] = useState("");
  const [editandoWa2, setEditandoWa2] = useState(false);
  const [wa2Input, setWa2Input] = useState("");
  const [guardandoWa2, setGuardandoWa2] = useState(false);
  const [wa2Ok, setWa2Ok] = useState(false);
  const [wa2Error, setWa2Error] = useState("");

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
    supabase
      .from("configuracion")
      .select("value")
      .eq("key", "whatsapp2")
      .maybeSingle()
      .then(({ data }) => { if (data?.value) setWhatsapp2(data.value); });
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
    setWaError("");
    const { error: err } = await supabase
      .from("configuracion")
      .upsert({ key: "whatsapp", value: waInput.trim() }, { onConflict: "key" });
    if (!err) {
      setWhatsapp(waInput.trim());
      setEditandoWa(false);
      setWaOk(true);
      setTimeout(() => setWaOk(false), 2500);
    } else {
      setWaError(err.message || "Error al guardar. Verificá que la tabla 'configuracion' exista en Supabase.");
    }
    setGuardandoWa(false);
  };

  const guardarWa2 = async () => {
    setGuardandoWa2(true);
    setWa2Error("");
    const { error: err } = await supabase
      .from("configuracion")
      .upsert({ key: "whatsapp2", value: wa2Input.trim() }, { onConflict: "key" });
    if (!err) {
      setWhatsapp2(wa2Input.trim());
      setEditandoWa2(false);
      setWa2Ok(true);
      setTimeout(() => setWa2Ok(false), 2500);
    } else {
      setWa2Error(err.message || "Error al guardar. Verificá que la tabla 'configuracion' exista en Supabase.");
    }
    setGuardandoWa2(false);
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
          <>
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
              <button className={styles.btnSecundario} onClick={() => { setEditandoWa(false); setWaError(""); }}>
                Cancelar
              </button>
            </div>
            {waError && <p className={styles.errorMsg} style={{ marginTop: "0.5rem" }}>{waError}</p>}
          </>
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

      {/* WhatsApp 2 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>WhatsApp secundario de pedidos</h2>
        <p className={styles.ayuda}>
          Número adicional que también recibe una copia de cada pedido (opcional). Mismo formato: 549 + código de área sin 0 + número sin 15.
        </p>
        {editandoWa2 ? (
          <>
            <div className={styles.formInline} style={{ marginTop: "0.75rem" }}>
              <input
                type="text"
                className={styles.input}
                value={wa2Input}
                onChange={(e) => setWa2Input(e.target.value)}
                placeholder="5491138860680"
                autoFocus
              />
              <button className={styles.btnPrimario} onClick={guardarWa2} disabled={guardandoWa2}>
                {guardandoWa2 ? "Guardando…" : "Guardar"}
              </button>
              <button className={styles.btnSecundario} onClick={() => { setEditandoWa2(false); setWa2Error(""); }}>
                Cancelar
              </button>
            </div>
            {wa2Error && <p className={styles.errorMsg} style={{ marginTop: "0.5rem" }}>{wa2Error}</p>}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
            <code style={{ background: "#f3f4f6", padding: "0.375rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.9rem", fontFamily: "monospace" }}>
              {whatsapp2 || "No configurado"}
            </code>
            <button
              className={styles.btnSecundario}
              onClick={() => { setWa2Input(whatsapp2); setEditandoWa2(true); }}
            >
              {whatsapp2 ? "Editar" : "Agregar"}
            </button>
            {wa2Ok && (
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
