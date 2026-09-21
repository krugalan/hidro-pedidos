import config from "../config";
import { ItemProducto } from "./ItemProducto";
import styles from "./ListaProductos.module.css";

interface Props {
  getCantidad: (id: string) => number;
  onAgregar: (id: string) => void;
  onQuitar: (id: string) => void;
}

export function ListaProductos({ getCantidad, onAgregar, onQuitar }: Props) {
  return (
    <section className={styles.seccion}>
      <p className={styles.descripcion}>
        Elegí lo que querés de la cosecha de esta semana. Hasta {config.maxPorProducto} unidades por producto.
      </p>
      <ul className={styles.lista}>
        {config.productos.map((p) => (
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
