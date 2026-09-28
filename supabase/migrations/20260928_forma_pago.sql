-- Agrega forma de pago a pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS forma_pago text CHECK (forma_pago IN ('efectivo', 'transferencia'));
