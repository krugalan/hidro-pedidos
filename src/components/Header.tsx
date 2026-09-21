import { proximaEntrega } from "../lib/fecha";
import { getCliente } from "../lib/cliente";
import styles from "./Header.module.css";

export function Header() {
  const cliente = getCliente();
  const primerNombre = cliente?.nombre?.trim().split(" ")[0];
  const fecha = proximaEntrega();

  return (
    <header className={styles.header}>
      <p className={styles.saludo}>
        {primerNombre ? `Hola, ${primerNombre} 👋` : "Hidro Pinamar"}
      </p>
      <p className={styles.fecha}>Entrega el {fecha}</p>
    </header>
  );
}
