const KEY = 'hidro_ultimo_pedido';

export function siguienteNumeroPedido(): number {
  const ultimo = parseInt(localStorage.getItem(KEY) ?? '99', 10);
  const siguiente = ultimo + 1;
  localStorage.setItem(KEY, String(siguiente));
  return siguiente;
}

export function numeroPedidoActual(): number {
  return parseInt(localStorage.getItem(KEY) ?? '99', 10);
}
