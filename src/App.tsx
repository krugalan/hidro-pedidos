import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { Header } from "./components/Header";
import { ListaProductos } from "./components/ListaProductos";
import { BarraTotal } from "./components/BarraTotal";
import { HojaCierre } from "./components/HojaCierre";
import { useCarrito } from "./hooks/useCarrito";
import styles from "./App.module.css";

const AdminApp = lazy(() => import("./pages/admin/AdminApp").then((m) => ({ default: m.AdminApp })));

function Tienda() {
  const { items, agregar, quitar, getCantidad, subtotal, totalUnidades } = useCarrito();
  const [hojaAbierta, setHojaAbierta] = useState(false);

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <ListaProductos
          getCantidad={getCantidad}
          onAgregar={agregar}
          onQuitar={quitar}
        />
      </main>
      <BarraTotal
        totalUnidades={totalUnidades}
        subtotal={subtotal}
        onTerminar={() => setHojaAbierta(true)}
      />
      {hojaAbierta && (
        <HojaCierre
          items={items}
          subtotal={subtotal}
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
