import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useMemo } from "react";
import { Header } from "./components/Header";
import { ListaProductos } from "./components/ListaProductos";
import { BarraTotal } from "./components/BarraTotal";
import { HojaCierre } from "./components/HojaCierre";
import { SinCosecha } from "./components/SinCosecha";
import { Avisame } from "./components/Avisame";
import { Gracias } from "./components/Gracias";
import { useCarrito } from "./hooks/useCarrito";
import { useCosechaActiva } from "./hooks/useCosechaActiva";
import { useZonas } from "./hooks/useZonas";
import { useConfiguracion } from "./hooks/useConfiguracion";
import type { ProductoUI, PedidoResumen } from "./types";
import styles from "./App.module.css";

const AdminApp = lazy(() => import("./pages/admin/AdminApp").then((m) => ({ default: m.AdminApp })));

function Tienda() {
  const { cosechaActiva, proximaCosecha, loading } = useCosechaActiva();
  const { zonas } = useZonas();
  const { cfg } = useConfiguracion();
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [avisameAbierto, setAvisameAbierto] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState<PedidoResumen | null>(null);

  const productos: ProductoUI[] = useMemo(() => {
    if (!cosechaActiva?.items?.length) return [];
    return cosechaActiva.items
      .filter((item) => item.producto?.activo)
      .map((item) => ({
        id: item.producto!.id,
        nombre: item.producto!.nombre,
        detalle: item.producto!.detalle ?? "",
        precio: item.producto!.precio,
        emoji: item.producto!.emoji ?? "🌿",
        maxPorProducto: item.producto!.max_por_producto,
      }));
  }, [cosechaActiva]);

  const { items, agregar, quitar, getCantidad, subtotal, totalUnidades, limpiar } = useCarrito(productos);

  const proximaFecha = cosechaActiva?.fechas
    ?.filter((f) => f.activa)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .find((f) => f.fecha >= new Date().toISOString().split("T")[0])
    ?.fecha;

  if (loading) {
    return (
      <div className={styles.app}>
        <Header />
        <main className={styles.main} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--color-texto-sec)", fontSize: "0.9rem" }}>Cargando…</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Header
        nombreCosecha={pedidoEnviado ? undefined : cosechaActiva?.nombre}
        fechaEntrega={pedidoEnviado ? undefined : proximaFecha}
      />
      <main className={styles.main}>
        {pedidoEnviado ? (
          <Gracias
            resumen={pedidoEnviado}
            onNuevoPedido={() => { setPedidoEnviado(null); limpiar(); }}
          />
        ) : productos.length > 0 ? (
          <ListaProductos
            productos={productos}
            getCantidad={getCantidad}
            onAgregar={agregar}
            onQuitar={quitar}
          />
        ) : (
          <SinCosecha
            proximaCosecha={proximaCosecha}
            onAvisame={() => setAvisameAbierto(true)}
          />
        )}
      </main>

      {productos.length > 0 && !pedidoEnviado && (
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
          fechas={cosechaActiva?.fechas ?? []}
          cosechaId={cosechaActiva?.id}
          whatsapp={cfg.whatsapp}
          onCerrar={() => setHojaAbierta(false)}
          onEnviado={(resumen) => {
            setPedidoEnviado(resumen);
            setHojaAbierta(false);
          }}
        />
      )}

      {avisameAbierto && (
        <Avisame onCerrar={() => setAvisameAbierto(false)} />
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
