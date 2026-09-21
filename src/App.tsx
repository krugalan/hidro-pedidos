import { useState } from "react";
import { Header } from "./components/Header";
import { ListaProductos } from "./components/ListaProductos";
import { BarraTotal } from "./components/BarraTotal";
import { HojaCierre } from "./components/HojaCierre";
import { useCarrito } from "./hooks/useCarrito";
import styles from "./App.module.css";

export function App() {
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

export default App;
