import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useMemo } from "react";
import { Header } from "./components/Header";
import { ListaProductos } from "./components/ListaProductos";
import { BarraTotal } from "./components/BarraTotal";
import { HojaCierre } from "./components/HojaCierre";
import { useCarrito } from "./hooks/useCarrito";
import { useCosechaActiva } from "./hooks/useCosechaActiva";
import { useZonas } from "./hooks/useZonas";
import type { ProductoUI } from "./types";
import styles from "./App.module.css";

const AdminApp = lazy(() => import("./pages/admin/AdminApp").then((m) => ({ default: m.AdminApp })));

function Tienda() {
  const { cosecha, loading } = useCosechaActiva();
  const { zonas } = useZonas();
  const [hojaAbierta, setHojaAbierta] = useState(false);

  const productos: ProductoUI[] = useMemo(() => {
    if (!cosecha?.items?.length) return [];
    return cosecha.items
      .filter((item) => item.producto?.activo)
      .map((item) => ({
        id: item.producto!.id,
        nombre: item.producto!.nombre,
        detalle: item.producto!.detalle ?? "",
        precio: item.producto!.precio,
        emoji: item.producto!.emoji ?? "🌿",
        maxPorProducto: item.producto!.max_por_producto,
      }));
  }, [cosecha]);

  const { items, agregar, quitar, getCantidad, subtotal, totalUnidades } = useCarrito(productos);

  const proximaFecha = cosecha?.fechas
    ?.filter((f) => f.activa)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .find((f) => f.fecha >= new Date().toISOString().split("T")[0])
    ?.fecha;

  if (loading) {
    return (
      <div className={styles.app}>
        <Header />
        <main className={styles.main} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--color-texto-sec)", fontSize: "0.9rem" }}>Cargando cosecha…</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Header fechaEntrega={proximaFecha} />
      <main className={styles.main}>
        {productos.length > 0 ? (
          <ListaProductos
            productos={productos}
            getCantidad={getCantidad}
            onAgregar={agregar}
            onQuitar={quitar}
          />
        ) : (
          <div className={styles.sinCosecha}>
            <p className={styles.sinCosechaTitulo}>No hay cosecha disponible</p>
            <p className={styles.sinCosechaDesc}>¡Pronto abrimos los pedidos de la próxima entrega!</p>
          </div>
        )}
      </main>

      {productos.length > 0 && (
        <BarraTotal
          totalUnidades={totalUnidades}
          subtotal={subtotal}
          onTerminar={() => setHojaAbierta(true)}
        />
      )}

      {hojaAbierta && (
        <HojaCierre
          items={items}
          subtotal={subtotal}
          zonas={zonas}
          onCerrar={() => setHojaAbierta(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route path="/*" element={<Tienda />} />
    </Routes>
  );
}

export default App;
