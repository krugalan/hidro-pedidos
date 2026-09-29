-- Agrega el estado 'pagado' para pedidos con transferencia
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('pendiente', 'confirmado', 'pagado', 'entregado', 'cancelado'));
