-- ============================================================
-- Pedido manual — Sandra Patricia Cerioni
-- Jueves 1 de octubre de 2026 · Retiro Paseo del Agora
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

DO $$
DECLARE
  v_zona_id          UUID;
  v_cosecha_id       UUID;
  v_fecha_entrega_id UUID;
  v_cliente_id       UUID;
  v_pedido_id        UUID;
  v_numero           INTEGER;

  v_lechuga_crespa    TEXT;
  v_lechuga_mantecosa TEXT;
  v_rucula            TEXT;
  v_perejil           TEXT;
BEGIN

  -- ── Zona ────────────────────────────────────────────────────
  SELECT id INTO v_zona_id FROM zonas WHERE nombre ILIKE '%agora%' LIMIT 1;
  IF v_zona_id IS NULL THEN
    RAISE EXCEPTION 'Zona "Paseo del Agora" no encontrada. Revisá con: SELECT nombre FROM zonas;';
  END IF;

  -- ── Cosecha y fecha de entrega ───────────────────────────────
  SELECT c.id INTO v_cosecha_id
  FROM cosechas c
  JOIN fechas_entrega fe ON fe.cosecha_id = c.id
  WHERE fe.fecha = '2026-10-01'
  LIMIT 1;

  IF v_cosecha_id IS NULL THEN
    SELECT id INTO v_cosecha_id FROM cosechas WHERE activa = true ORDER BY fecha_cosecha ASC LIMIT 1;
    RAISE NOTICE 'No hay fecha_entrega para 2026-10-01. Se usó la cosecha activa más próxima (%).', v_cosecha_id;
  END IF;

  SELECT id INTO v_fecha_entrega_id
  FROM fechas_entrega WHERE fecha = '2026-10-01' AND cosecha_id = v_cosecha_id
  LIMIT 1;

  -- ── Productos ────────────────────────────────────────────────
  SELECT id INTO v_lechuga_crespa    FROM productos WHERE nombre ILIKE '%lechuga crespa%'    LIMIT 1;
  SELECT id INTO v_lechuga_mantecosa FROM productos WHERE nombre ILIKE '%lechuga mantecosa%' LIMIT 1;
  SELECT id INTO v_rucula            FROM productos WHERE nombre ILIKE '%r_cula%'             LIMIT 1;
  SELECT id INTO v_perejil           FROM productos WHERE nombre ILIKE '%perejil%'            LIMIT 1;

  -- ── Cliente — crear si no existe ────────────────────────────
  SELECT id INTO v_cliente_id FROM clientes WHERE nombre ILIKE 'Sandra Patricia Cerioni' LIMIT 1;
  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (nombre) VALUES ('Sandra Patricia Cerioni') RETURNING id INTO v_cliente_id;
    RAISE NOTICE 'Cliente creado (id: %)', v_cliente_id;
  ELSE
    RAISE NOTICE 'Cliente ya existía (id: %)', v_cliente_id;
  END IF;

  -- ── Pedido ───────────────────────────────────────────────────
  v_numero := nextval('pedidos_numero_seq');

  INSERT INTO pedidos (
    numero, cliente_id, cosecha_id, fecha_entrega_id, zona_id,
    tipo_entrega, estado, forma_pago,
    subtotal, costo_envio, total
  ) VALUES (
    v_numero, v_cliente_id, v_cosecha_id, v_fecha_entrega_id, v_zona_id,
    'retiro', 'pendiente', 'efectivo',
    8600, 0, 8600
  ) RETURNING id INTO v_pedido_id;

  -- ── Items ────────────────────────────────────────────────────
  INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unitario, cantidad, subtotal) VALUES
    (v_pedido_id, v_lechuga_crespa,    'Lechuga Crespa',    2400, 1, 2400),
    (v_pedido_id, v_lechuga_mantecosa, 'Lechuga Mantecosa', 2400, 1, 2400),
    (v_pedido_id, v_rucula,            'Rúcula',            1400, 2, 2800),
    (v_pedido_id, v_perejil,           'Perejil',           1000, 1, 1000);

  RAISE NOTICE '=== Pedido #% creado para Sandra Patricia Cerioni (pedido id: %) ===', v_numero, v_pedido_id;

END $$;
