-- Permite que usuarios anónimos (formulario público) creen clientes y pedidos.
-- Las políticas de admin (authenticated) ya existen; estas agregan acceso al rol anon.

-- clientes
DROP POLICY IF EXISTS "anon_insert_clientes" ON clientes;
DROP POLICY IF EXISTS "anon_select_clientes" ON clientes;
CREATE POLICY "anon_insert_clientes"
  ON clientes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_clientes"
  ON clientes FOR SELECT TO anon USING (true);

-- pedidos
DROP POLICY IF EXISTS "anon_insert_pedidos" ON pedidos;
DROP POLICY IF EXISTS "anon_select_pedidos" ON pedidos;
CREATE POLICY "anon_insert_pedidos"
  ON pedidos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_pedidos"
  ON pedidos FOR SELECT TO anon USING (true);

-- pedido_items
DROP POLICY IF EXISTS "anon_insert_pedido_items" ON pedido_items;
CREATE POLICY "anon_insert_pedido_items"
  ON pedido_items FOR INSERT TO anon WITH CHECK (true);
