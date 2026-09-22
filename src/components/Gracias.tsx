import { useState } from "react";
import type { PedidoResumen } from "../types";
import styles from "./Gracias.module.css";

interface Props {
  resumen: PedidoResumen;
  onNuevoPedido: () => void;
}

const formatPeso = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

export function Gracias({ resumen, onNuevoPedido }: Props) {
  const [copiado, setCopiado] = useState(false);

  const { numero, nombre, items, total, entrega, fechaIso, zonaSeleccionada } = resumen;

  const primerNombre = nombre.split(" ")[0];

  const subtitulo = (() => {
    if (fechaIso) {
      const cuando = fechaLarga(fechaIso);
      return entrega === "retiro"
        ? `Retirás el ${cuando}${zonaSeleccionada ? ` en ${zonaSeleccionada}` : ""}`
        : `Entrega el ${cuando}`;
    }
    return entrega === "retiro" ? "Pedido para retirar" : "Pedido para entrega a domicilio";
  })();

  const compartir = async () => {
    const url = window.location.origin;
    const text = "¡Probá las verduras frescas de Hidro Pinamar! 🌱 Pedí directo desde la web, es facilísimo.";
    if (navigator.share) {
      try { await navigator.share({ title: "Hidro Pinamar 🌱", text, url }); } catch { /* cancelado */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      } catch { /* sin permisos */ }
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.hero}>
        <span className={styles.icono}>🌱</span>
        <h1 className={styles.titulo}>¡Gracias, {primerNombre}!</h1>
        {numero > 0 && <p className={styles.numero}>Pedido #{numero}</p>}
        <p className={styles.subtitulo}>{subtitulo}</p>
      </div>

      <div className={styles.resumenCard}>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.id} className={styles.itemFila}>
              <span className={styles.itemNombre}>
                {item.emoji} {item.cantidad} × {item.nombre}
              </span>
              <span className={styles.itemPrecio}>{formatPeso(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.totalFila}>
          <span className={styles.totalLabel}>{entrega === "domicilio" ? "Total con envío" : "Total"}</span>
          <span className={styles.totalMonto}>{formatPeso(total)}</span>
        </div>
      </div>

      <p className={styles.instruccion}>
        Revisá WhatsApp y tocá <strong>Enviar</strong> para confirmar el pedido con nosotros.
      </p>

      <div className={styles.acciones}>
        <button className={styles.btnPrimario} onClick={compartir} type="button">
          {copiado ? "¡Link copiado! ✓" : "📣 Compartir con amigos"}
        </button>
        <button className={styles.btnSecundario} onClick={onNuevoPedido} type="button">
          🛒 Hacer otro pedido
        </button>
      </div>
    </div>
  );
}
