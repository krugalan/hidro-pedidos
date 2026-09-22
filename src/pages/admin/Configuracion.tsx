import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Zona, Producto } from "../../types/entities";
import styles from "./Admin.module.css";

export function Configuracion() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [nuevaZona, setNuevaZona] = useState("");
  const [error, setError] = useState("");

  const cargarZonas = async () => {
    const { data } = await supabase.from("zonas").select("*").order("nombre");
    setZonas((data ?? []) as Zona[]);
    setLoadingZonas(false);
  };

  const cargarProductos = async () => {
    const { data } = await supabase.from("productos").select("*").order("nombre");
    setProductos((data ?? []) as Producto[]);
    setLoadingProductos(false);
  };

  useEffect(() => {
    cargarZonas();
    cargarProductos();
  }, []);

  const [tipoNuevaZona, setTipoNuevaZona] = useState<'delivery'|'retiro'>('delivery');

  const crearZona = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: err } = await supabase.from("zonas").insert({ nombre: nuevaZona.trim(), tipo: tipoNuevaZona });
    if (err) setError(err.message);
    else { setNuevaZona(""); cargarZonas(); }
  };

  const eliminarZona = async (id: string) => {
    await supabase.from("zonas").delete().eq("id", id);
    cargarZonas();
  };

  const toggleTipoZona = async (zona: import("../../types/entities").Zona) => {
    const nuevo = zona.tipo === 'delivery' ? 'retiro' : 'delivery';
    await supabase.from("zonas").update({ tipo: nuevo }).eq("id", zona.id);
    cargarZonas();
  };

  const actualizarMaxProducto = async (id: string, max: number) => {
    await supabase.from("productos").update({ max_por_producto: max }).eq("id", id);
    cargarProductos();
  };

  const toggleProductoActivo = async (producto: Producto) => {
    await supabase.from("productos").update({ activo: !producto.activo }).eq("id", producto.id);
    cargarProductos();
  };

  return (
    <div className={styles.pagina}>
      <h1 className={styles.paginaTitulo}>Configuración</h1>

      {/* Zonas */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Zonas de entrega</h2>

        <form onSubmit={crearZona} className={styles.formInline}>
          <input type="text" className={styles.input} value={nuevaZona} onChange={(e) => setNuevaZona(e.target.value)} required placeholder="Nombre de zona (Ej: Centro)" />
          <select className={styles.inputPeque} value={tipoNuevaZona} onChange={(e) => setTipoNuevaZona(e.target.value as 'delivery'|'retiro')}>
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
                    className={z.tipo === 'retiro' ? styles.btnInactiva : styles.btnActiva}
                    onClick={() => toggleTipoZona(z)}
                    title="Cambiar tipo"
                  >
                    {z.tipo === 'retiro' ? '🏠 Retiro' : '🚚 Delivery'}
                  </button>
                  <button className={styles.btnDanger} onClick={() => eliminarZona(z.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Productos */}
      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Productos</h2>
        <p className={styles.ayuda}>Controlá el máximo por producto y activá/desactivá según disponibilidad.</p>

        {loadingProductos ? (
          <p className={styles.estado}>Cargando…</p>
        ) : productos.length === 0 ? (
          <p className={styles.estado}>No hay productos en la base. Ejecutá el schema SQL primero.</p>
        ) : (
          <div className={styles.productosGrid}>
            {productos.map((p) => (
              <div key={p.id} className={`${styles.productoCard} ${!p.activo ? styles.cardInactiva : ""}`}>
                <div className={styles.productoHeader}>
                  <span className={styles.productoEmoji}>{p.emoji}</span>
                  <span className={styles.productoNombre}>{p.nombre}</span>
                </div>
                <div className={styles.productoControles}>
                  <label className={styles.labelPeque}>Máx. por pedido</label>
                  <input
                    type="number"
                    className={styles.inputNumero}
                    value={p.max_por_producto}
                    min={1}
                    max={99}
                    onChange={(e) => actualizarMaxProducto(p.id, Number(e.target.value))}
                  />
                  <button
                    className={p.activo ? styles.btnActiva : styles.btnInactiva}
                    onClick={() => toggleProductoActivo(p)}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
