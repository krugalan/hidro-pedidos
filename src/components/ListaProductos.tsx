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
  return (
    <section className={styles.seccion}>
      <p className={styles.descripcion}>
        Elegí lo que querés de la cosecha de esta semana.
      </p>
      <ul className={styles.lista}>
        {productos.map((p) => (
          <ItemProducto
            key={p.id}
            producto={p}
            cantidad={getCantidad(p.id)}
            onAgregar={onAgregar}
            onQuitar={onQuitar}
          />
        ))}
      </ul>
    </section>
  );
}
