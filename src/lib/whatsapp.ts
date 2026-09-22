import config from "../config";
import type { ItemCarrito, TipoEntrega } from "../types";
import { proximaEntrega } from "./fecha";

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);

const DISCLAIMER =
  "_Al confirmar este pedido aceptás que puede haber artículos sin stock al momento del retiro y que los precios vigentes en ese momento son los que aplican._\n*Validaremos los montos al momento de la entrega.*";

export function armarMensaje(
  items: ItemCarrito[],
  nombre: string,
  entrega: TipoEntrega,
  direccion: string,
  notas: string,
  numeroPedido: number
): string {
  const fecha = proximaEntrega();
  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const total = entrega === "domicilio" ? subtotal + config.envioCosto : subtotal;

  const lineas = items
    .map((i) => `• ${i.cantidad} × ${i.nombre} — ${formatPeso(i.precio * i.cantidad)}`)
    .join("\n");

  let msg = `Hola! Soy ${nombre}. Pedido #${numeroPedido} para el ${fecha}:\n\n${lineas}\n\nSubtotal: ${formatPeso(subtotal)}`;

  if (entrega === "domicilio") {
    msg += `\nEnvío a domicilio: ${formatPeso(config.envioCosto)}`;
    msg += `\nDirección: ${direccion}, Pinamar`;
  } else {
    msg += `\nRetiro en Zona Hospital (${config.retiroLugar})`;
  }

  msg += `\n*Total: ${formatPeso(total)}*`;

  if (notas.trim()) {
    msg += `\n\nNotas: ${notas.trim()}`;
  }

  msg += `\n\n${DISCLAIMER}`;

  return msg;
}

export function armarLinkWhatsApp(
  items: ItemCarrito[],
  nombre: string,
  entrega: TipoEntrega,
  direccion: string,
  notas: string,
  numeroPedido: number
): string {
  const mensaje = armarMensaje(items, nombre, entrega, direccion, notas, numeroPedido);
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
