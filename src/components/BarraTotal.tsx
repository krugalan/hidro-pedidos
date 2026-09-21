import styles from "./BarraTotal.module.css";

interface Props {
  totalUnidades: number;
  subtotal: number;
  onTerminar: () => void;
}

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);

export function BarraTotal({ totalUnidades, subtotal, onTerminar }: Props) {
  const vacio = totalUnidades === 0;
  const labelUnidades = totalUnidades === 1 ? "1 unidad" : `${totalUnidades} unidades`;

  return (
    <div className={styles.barra}>
      <div className={styles.inner}>
        <div className={styles.resumen} aria-live="polite" aria-atomic="true">
          {vacio ? (
            <p className={styles.vacio}>Tu pedido está vacío</p>
          ) : (
            <>
              <p className={styles.unidades}>{labelUnidades}</p>
              <p className={styles.subtotal}>{formatPeso(subtotal)}</p>
            </>
          )}
        </div>
        <button
          className={styles.btnTerminar}
          onClick={onTerminar}
          disabled={vacio}
          aria-disabled={vacio}
        >
          Terminar pedido
        </button>
      </div>
    </div>
  );
}
