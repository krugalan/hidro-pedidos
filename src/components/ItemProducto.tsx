import type { ProductoUI } from "../types";
import styles from "./ItemProducto.module.css";

interface Props {
  producto: ProductoUI;
  cantidad: number;
  expandido: boolean;
  onAgregar: (id: string) => void;
  onQuitar: (id: string) => void;
  onExpandir: (id: string) => void;
}

const formatPeso = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

export function ItemProducto({ producto, cantidad, expandido, onAgregar, onQuitar, onExpandir }: Props) {
  const enMax = cantidad >= producto.maxPorProducto;

  if (expandido) {
    return (
      <li className={styles.itemExpandido}>
        <div
          className={styles.expandidoInfo}
          role="button"
          tabIndex={0}
          aria-label={`Colapsar ${producto.nombre}`}
          onClick={() => onExpandir(producto.id)}
          onKeyDown={(e) => e.key === "Enter" && onExpandir(producto.id)}
        >
          <div className={styles.expandidoEmoji}>{producto.emoji}</div>
          <div className={styles.expandidoTexto}>
            <p className={styles.expandidoNombre}>{producto.nombre}</p>
            <p className={styles.expandidoDetalle}>
              <span className={styles.expandidoPrecio}>{formatPeso(producto.precio)}</span>
              {producto.detalle && <> · {producto.detalle}</>}
            </p>
          </div>
        </div>

        <div
          className={styles.expandidoSelector}
          role="group"
          aria-label={`Cantidad de ${producto.nombre}`}
        >
          <button
            className={styles.btnExpandido}
            onClick={() => onQuitar(producto.id)}
            disabled={cantidad === 0}
            aria-label={`Quitar ${producto.nombre}`}
          >
            −
          </button>
          <span className={styles.expandidoCantidad}>{cantidad}</span>
          <button
            className={`${styles.btnExpandido} ${!enMax ? styles.btnExpandidoActivo : ""}`}
            onClick={() => onAgregar(producto.id)}
            disabled={enMax}
            aria-label={`Agregar ${producto.nombre}`}
          >
            +
          </button>
        </div>

        {enMax && (
          <p className={styles.expandidoMaxAviso}>Máximo {producto.maxPorProducto}</p>
        )}
      </li>
    );
  }

  return (
    <li className={`${styles.item} ${cantidad > 0 ? styles.activo : ""}`}>
      <div
        className={styles.infoArea}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de ${producto.nombre}`}
        onClick={() => onExpandir(producto.id)}
        onKeyDown={(e) => e.key === "Enter" && onExpandir(producto.id)}
      >
        <div className={styles.emoji} aria-hidden="true">{producto.emoji}</div>
        <div className={styles.info}>
          <p className={styles.nombre}>{producto.nombre}</p>
          <p className={styles.detalle}>
            <span className={styles.precio}>{formatPeso(producto.precio)}</span>
            {" · "}
            {producto.detalle}
          </p>
          {enMax && (
            <p className={styles.maxAviso} role="status">
              Máximo {producto.maxPorProducto}
            </p>
          )}
        </div>
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
