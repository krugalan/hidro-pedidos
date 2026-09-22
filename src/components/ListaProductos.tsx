import { useState } from "react";
import type { ProductoUI } from "../types";
import { ItemProducto } from "./ItemProducto";
import styles from "./ListaProductos.module.css";

interface Props {
  productos: ProductoUI[];
  getCantidad: (id: string) => number;
  onAgregar: (id: string) => void;
  onQuitar: (id: string) => void;
}

export function ListaProductos({ productos, getCantidad, onAgregar, onQuitar }: Props) {
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const handleAgregar = (id: string) => {
    onAgregar(id);
    // Tocar el contador de otro producto colapsa el expandido
    if (id !== expandidoId) setExpandidoId(null);
  };

  const handleQuitar = (id: string) => {
    onQuitar(id);
    if (id !== expandidoId) setExpandidoId(null);
  };

  const handleExpandir = (id: string) => {
    setExpandidoId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={styles.seccion}>
      <p className={styles.descripcion}>Elegí lo que querés de la cosecha de esta semana.</p>
      <ul className={styles.lista}>
        {productos.map((p) => {
          const expandido = expandidoId === p.id;
          return (
            <ItemProducto
              // Cambiar la key al expandir/colapsar fuerza el remount
              // y dispara la animación CSS del estado nuevo
              key={`${p.id}-${expandido ? "exp" : "col"}`}
              producto={p}
              cantidad={getCantidad(p.id)}
              expandido={expandido}
              onAgregar={handleAgregar}
              onQuitar={handleQuitar}
              onExpandir={handleExpandir}
            />
          );
        })}
      </ul>
    </section>
  );
}
