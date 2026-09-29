const KEY = 'hidro_ultimo_pedido';

export function siguienteNumeroPedido(): number {
  const guardado = localStorage.getItem(KEY);
  // Si el dispositivo nunca usó la tienda, sembrar con un número aleatorio
  // para evitar que todos los browsers frescos generen #100.
  // El número real siempre viene del DB cuando el INSERT tiene éxito.
  const ultimo = guardado !== null
    ? parseInt(guardado, 10)
    : Math.floor(Math.random() * 9000) + 900;
  const siguiente = ultimo + 1;
  localStorage.setItem(KEY, String(siguiente));
  return siguiente;
}

export function numeroPedidoActual(): number {
  const guardado = localStorage.getItem(KEY);
  return guardado !== null ? parseInt(guardado, 10) : 0;
}
