import { proximaEntrega } from "../lib/fecha";
import { getCliente } from "../lib/cliente";
import styles from "./Header.module.css";

interface Props {
  fechaEntrega?: string;
}

export function Header({ fechaEntrega }: Props) {
  const cliente = getCliente();
  const primerNombre = cliente?.nombre?.trim().split(" ")[0];

  const fecha = fechaEntrega
    ? new Date(fechaEntrega + "T00:00:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
      })
    : proximaEntrega();

  return (
    <header className={styles.header}>
      <p className={styles.saludo}>
        {primerNombre ? `Hola, ${primerNombre} 👋` : "Hidro Pinamar"}
      </p>
      <p className={styles.fecha}>Entrega el {fecha}</p>
    </header>
  );
}
