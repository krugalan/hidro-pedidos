import type { ProductoUI } from "../types";
import styles from "./ItemProducto.module.css";

interface Props {
  producto: ProductoUI;
  cantidad: number;
  onAgregar: (id: string) => void;
  onQuitar: (id: string) => void;
}

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);

export function ItemProducto({ producto, cantidad, onAgregar, onQuitar }: Props) {
  const enMax = cantidad >= producto.maxPorProducto;

  return (
    <li className={`${styles.item} ${cantidad > 0 ? styles.activo : ""}`}>
      <div className={styles.emoji} aria-hidden="true">
        {producto.emoji}
      </div>

      <div className={styles.info}>
        <p className={styles.nombre}>{producto.nombre}</p>
        <p className={styles.detalle}>
          <span className={styles.precio}>{formatPeso(producto.precio)}</span>
          {" · "}
          {producto.detalle}
        </p>
        {enMax && (
          <p className={styles.maxAviso} role="status">
            Llegaste al máximo de {producto.maxPorProducto}
          </p>
        )}
      </div>

      <div className={styles.selector} role="group" aria-label={`Cantidad de ${producto.nombre}`}>
        <button
          className={styles.btn}
          onClick={() => onQuitar(producto.id)}
          disabled={cantidad === 0}
          aria-label={`Quitar ${producto.nombre}`}
        >
          −
        </button>
        <span className={styles.cantidad} aria-live="polite" aria-atomic="true">
          {cantidad}
        </span>
        <button
          className={styles.btn}
          onClick={() => onAgregar(producto.id)}
          disabled={enMax}
          aria-label={`Agregar ${producto.nombre}`}
        >
          +
        </button>
      </div>
    </li>
  );
}
