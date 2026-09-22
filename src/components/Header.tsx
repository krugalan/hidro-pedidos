import { getCliente } from "../lib/cliente";
import styles from "./Header.module.css";

interface Props {
  nombreCosecha?: string;
  fechaEntrega?: string;
}

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

export function Header({ nombreCosecha, fechaEntrega }: Props) {
  const cliente = getCliente();
  const primerNombre = cliente?.nombre?.trim().split(" ")[0];

  return (
    <header className={styles.header}>
      <p className={styles.saludo}>
        {primerNombre ? `Hola, ${primerNombre} 👋` : "Hidro Pinamar"}
      </p>
      {nombreCosecha && (
        <p className={styles.cosecha}>{nombreCosecha}</p>
      )}
      {fechaEntrega && (
        <p className={styles.fecha}>Entrega el {fechaLarga(fechaEntrega)}</p>
      )}
    </header>
  );
}
