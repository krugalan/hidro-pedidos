import { useState } from "react";
import { formatPeso, formatPrecio } from "../lib/precio";
import type { PedidoResumen } from "../types";
import styles from "./Gracias.module.css";

const DATOS_TRANSFERENCIA = {
  titular: "Andrea Beatriz Diez",
  alias: "andrea978",
  cvu: "0000003100013090953264",
};

interface Props {
  resumen: PedidoResumen;
  onNuevoPedido: () => void;
}

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

export function Gracias({ resumen, onNuevoPedido }: Props) {
  const [copiado, setCopiado] = useState(false);
  const [copiadoAlias, setCopiadoAlias] = useState(false);
  const [copiadoCvu, setCopiadoCvu] = useState(false);

  const { numero, nombre, items, total, entrega, tipoPago, fechaIso, zonaSeleccionada } = resumen;

  const copiar = async (texto: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(texto);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch { /* sin permisos */ }
  };

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
              <span className={styles.itemPrecio}>{formatPrecio(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.totalFila}>
          <span className={styles.totalLabel}>{entrega === "domicilio" ? "Total con envío" : "Total"}</span>
          <span className={styles.totalMonto}>{formatPeso(total)}</span>
        </div>
      </div>

      {tipoPago === "transferencia" && (
        <div className={styles.pagoCard}>
          <p className={styles.pagoTitulo}>🏦 Datos para la transferencia</p>
          <p className={styles.pagoNota}>Enviá el comprobante por WhatsApp junto con tu pedido</p>
          <div className={styles.datoFila}>
            <span className={styles.datoLabel}>Titular</span>
            <span className={styles.datoValor}>{DATOS_TRANSFERENCIA.titular}</span>
          </div>
          <div className={styles.datoFila}>
            <span className={styles.datoLabel}>Alias</span>
            <div className={styles.datoConCopy}>
              <span className={styles.datoValor}>{DATOS_TRANSFERENCIA.alias}</span>
              <button className={styles.btnCopy} onClick={() => copiar(DATOS_TRANSFERENCIA.alias, setCopiadoAlias)} type="button">
                {copiadoAlias ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>
          <div className={styles.datoFila}>
            <span className={styles.datoLabel}>CVU</span>
            <div className={styles.datoConCopy}>
              <span className={`${styles.datoValor} ${styles.datoMono}`}>{DATOS_TRANSFERENCIA.cvu}</span>
              <button className={styles.btnCopy} onClick={() => copiar(DATOS_TRANSFERENCIA.cvu, setCopiadoCvu)} type="button">
                {copiadoCvu ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tipoPago === "efectivo" && (
        <div className={styles.pagoEfectivo}>
          <span className={styles.pagoEfectivoIcono}>💵</span>
          <p className={styles.pagoEfectivoTexto}>Abonás en efectivo al momento de la entrega del pedido</p>
        </div>
      )}

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
