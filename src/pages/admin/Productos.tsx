import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Producto } from "../../types/entities";
import styles from "./Admin.module.css";

const EMOJIS = ["🥬", "🌿", "🌱", "🍃", "🥗", "🧅", "🫛", "🥦", "🍅", "🧄", "🫑", "🌾"];

const VACÍO: Omit<Producto, "id" | "created_at"> = {
  nombre: "",
  detalle: "",
  precio: 0,
  emoji: "🌿",
  max_por_producto: 10,
  activo: true,
};

const formatPeso = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState(VACÍO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase.from("productos").select("*").order("nombre");
    setProductos((data ?? []) as Producto[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setEditando(null); setForm(VACÍO); setError(""); setMostrarForm(true); };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({ nombre: p.nombre, detalle: p.detalle ?? "", precio: p.precio, emoji: p.emoji ?? "🌿", max_por_producto: p.max_por_producto, activo: p.activo });
    setError("");
    setMostrarForm(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    if (editando) {
      const { error: err } = await supabase.from("productos").update(form).eq("id", editando.id);
      if (err) { setError(err.message); setGuardando(false); return; }
    } else {
      const id = form.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error: err } = await supabase.from("productos").insert({ ...form, id });
      if (err) { setError(err.message); setGuardando(false); return; }
    }

    setEditando(null);
    setForm(VACÍO);
    setMostrarForm(false);
    setGuardando(false);
    cargar();
  };

  const eliminar = async (p: Producto) => {
    const { count } = await supabase.from("cosecha_items").select("id", { count: "exact", head: true }).eq("producto_id", p.id);
    if ((count ?? 0) > 0) {
      setError(`"${p.nombre}" está en una o más cosechas. Quitalo de las cosechas antes de eliminar.`);
      return;
    }
    await supabase.from("productos").delete().eq("id", p.id);
    cargar();
  };

  const toggleActivo = async (p: Producto) => {
    await supabase.from("productos").update({ activo: !p.activo }).eq("id", p.id);
    cargar();
  };

  const modoEdicion = mostrarForm;

  return (
    <div className={styles.pagina}>
      <div className={styles.paginaHeaderRow}>
        <h1 className={styles.paginaTitulo}>Productos</h1>
        {!modoEdicion && (
          <button className={styles.btnPrimario} onClick={abrirNuevo}>+ Nuevo producto</button>
        )}
      </div>

      {/* Formulario */}
      {(modoEdicion || editando) && (
        <section className={styles.card}>
          <h2 className={styles.cardTitulo}>{editando ? "Editar producto" : "Nuevo producto"}</h2>
          <form onSubmit={guardar} className={styles.form}>
            <div className={styles.formFila}>
              <div className={styles.campo}>
                <label className={styles.label}>Nombre</label>
                <input type="text" className={styles.input} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: Lechuga mantecosa" />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Detalle</label>
                <input type="text" className={styles.input} value={form.detalle ?? ""} onChange={(e) => setForm({ ...form, detalle: e.target.value })} placeholder="Ej: planta con raíz" />
              </div>
            </div>

            <div className={styles.formFila}>
              <div className={styles.campo}>
                <label className={styles.label}>Precio ($)</label>
                <input type="number" className={styles.input} value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} required min={0} />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Máx. por pedido</label>
                <input type="number" className={styles.input} value={form.max_por_producto} onChange={(e) => setForm({ ...form, max_por_producto: Number(e.target.value) })} required min={1} max={99} />
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Emoji</label>
              <div className={styles.emojiGrid}>
                {EMOJIS.map((em) => (
                  <button key={em} type="button" className={`${styles.emojiBtn} ${form.emoji === em ? styles.emojiBtnActivo : ""}`} onClick={() => setForm({ ...form, emoji: em })}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.formBotones}>
              <button type="submit" className={styles.btnPrimario} disabled={guardando}>
                {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear producto"}
              </button>
              <button type="button" className={styles.btnSecundario} onClick={() => { setEditando(null); setForm(VACÍO); setMostrarForm(false); setError(""); }}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {error && !modoEdicion && <p className={styles.errorMsg} style={{ marginBottom: "0.75rem" }}>{error}</p>}

      {loading ? (
        <p className={styles.estado}>Cargando productos…</p>
      ) : productos.length === 0 ? (
        <p className={styles.estado}>No hay productos todavía.</p>
      ) : (
        <div className={styles.productosListAdmin}>
          {productos.map((p) => (
            <div key={p.id} className={`${styles.card} ${!p.activo ? styles.cardInactiva : ""}`}>
              <div className={styles.productoAdminRow}>
                <div className={styles.productoAdminInfo}>
                  <span className={styles.productoEmoji}>{p.emoji}</span>
                  <div>
                    <p className={styles.productoAdminNombre}>{p.nombre}</p>
                    <p className={styles.productoAdminDetalle}>{p.detalle} · {formatPeso(p.precio)} · máx {p.max_por_producto}</p>
                  </div>
                </div>
                <div className={styles.productoAdminAcciones}>
                  <button className={p.activo ? styles.btnActiva : styles.btnInactiva} onClick={() => toggleActivo(p)}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                  <button className={styles.btnSecundario} onClick={() => abrirEditar(p)}>Editar</button>
                  <button className={styles.btnDanger} onClick={() => eliminar(p)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
