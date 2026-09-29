-- ============================================================
-- Pedidos manuales — 1 de octubre de 2026
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================
-- Lookups compartidos: zona, cosecha y fecha de entrega.
-- Los números de pedido se asignan con nextval() para no
-- colisionar con la secuencia de la DB.
-- ============================================================

DO $$
DECLARE
  v_zona_id          UUID;
  v_cosecha_id       UUID;
  v_fecha_entrega_id UUID;

  -- Clientes
  v_marta_id         UUID;
  v_vanesa_id        UUID;
  v_gisela_id        UUID;

  -- Pedidos
  v_pedido_marta     UUID;
  v_pedido_vanesa    UUID;
  v_pedido_gisela    UUID;
  v_num_marta        INTEGER;
  v_num_vanesa       INTEGER;
  v_num_gisela       INTEGER;

  -- Productos (best-effort FK)
  v_lechuga_crespa    TEXT;
  v_rucula            TEXT;
  v_menta             TEXT;
  v_perejil           TEXT;
  v_lechuga_mantecosa TEXT;
BEGIN

  -- ── Zona ────────────────────────────────────────────────────
  SELECT id INTO v_zona_id FROM zonas WHERE nombre ILIKE '%agora%' LIMIT 1;
  IF v_zona_id IS NULL THEN
    RAISE EXCEPTION
      'Zona "Paseo del Agora" no encontrada. '
      'Verificá el nombre con: SELECT nombre FROM zonas;';
  END IF;

  -- ── Cosecha y fecha de entrega para el 01/10/2026 ───────────
  SELECT c.id INTO v_cosecha_id
  FROM cosechas c
  JOIN fechas_entrega fe ON fe.cosecha_id = c.id
  WHERE fe.fecha = '2026-10-01'
  LIMIT 1;

  IF v_cosecha_id IS NULL THEN
    SELECT id INTO v_cosecha_id
    FROM cosechas WHERE activa = true
    ORDER BY fecha_cosecha ASC LIMIT 1;
    RAISE NOTICE
      'No hay fecha_entrega para 2026-10-01. '
      'Se usó la primera cosecha activa (id: %). Ajustá si es necesario.', v_cosecha_id;
  END IF;

  SELECT id INTO v_fecha_entrega_id
  FROM fechas_entrega
  WHERE fecha = '2026-10-01' AND cosecha_id = v_cosecha_id
  LIMIT 1;

  -- ── Lookup de productos ─────────────────────────────────────
  SELECT id INTO v_lechuga_crespa    FROM productos WHERE nombre ILIKE '%lechuga crespa%'    LIMIT 1;
  SELECT id INTO v_rucula            FROM productos WHERE nombre ILIKE '%r_cula%'             LIMIT 1;
  SELECT id INTO v_menta             FROM productos WHERE nombre ILIKE '%menta%'              LIMIT 1;
  SELECT id INTO v_perejil           FROM productos WHERE nombre ILIKE '%perejil%'            LIMIT 1;
  SELECT id INTO v_lechuga_mantecosa FROM productos WHERE nombre ILIKE '%lechuga mantecosa%' LIMIT 1;

  -- ════════════════════════════════════════════════════════════
  -- PEDIDO 1 — Marta
  -- ════════════════════════════════════════════════════════════
  INSERT INTO clientes (nombre) VALUES ('Marta') RETURNING id INTO v_marta_id;
  v_num_marta := nextval('pedidos_numero_seq');

  INSERT INTO pedidos (
    numero, cliente_id, cosecha_id, fecha_entrega_id, zona_id,
    tipo_entrega, estado, forma_pago, subtotal, costo_envio, total
  ) VALUES (
    v_num_marta, v_marta_id, v_cosecha_id, v_fecha_entrega_id, v_zona_id,
    'retiro', 'pendiente', 'efectivo', 3800, 0, 3800
  ) RETURNING id INTO v_pedido_marta;

  INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unitario, cantidad, subtotal) VALUES
    (v_pedido_marta, v_lechuga_crespa, 'Lechuga Crespa', 2400, 1, 2400),
    (v_pedido_marta, v_rucula,         'Rúcula',         1400, 1, 1400);

  RAISE NOTICE 'Pedido #% creado para Marta (id: %)', v_num_marta, v_pedido_marta;

  -- ════════════════════════════════════════════════════════════
  -- PEDIDO 2 — Vanesa Raña
  -- ════════════════════════════════════════════════════════════
  INSERT INTO clientes (nombre) VALUES ('Vanesa Raña') RETURNING id INTO v_vanesa_id;
  v_num_vanesa := nextval('pedidos_numero_seq');

  INSERT INTO pedidos (
    numero, cliente_id, cosecha_id, fecha_entrega_id, zona_id,
    tipo_entrega, estado, forma_pago, subtotal, costo_envio, total
  ) VALUES (
    v_num_vanesa, v_vanesa_id, v_cosecha_id, v_fecha_entrega_id, v_zona_id,
    'retiro', 'pendiente', 'efectivo', 8200, 0, 8200
  ) RETURNING id INTO v_pedido_vanesa;

  INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unitario, cantidad, subtotal) VALUES
    (v_pedido_vanesa, v_menta,             'Menta',              2000, 1, 2000),
    (v_pedido_vanesa, v_perejil,           'Perejil',            1000, 1, 1000),
    (v_pedido_vanesa, v_rucula,            'Rúcula',             1400, 2, 2800),
    (v_pedido_vanesa, v_lechuga_mantecosa, 'Lechuga Mantecosa',  2400, 1, 2400);

  RAISE NOTICE 'Pedido #% creado para Vanesa Raña (id: %)', v_num_vanesa, v_pedido_vanesa;

  -- ════════════════════════════════════════════════════════════
  -- PEDIDO 3 — Gisela Piana
  -- ════════════════════════════════════════════════════════════
  INSERT INTO clientes (nombre) VALUES ('Gisela Piana') RETURNING id INTO v_gisela_id;
  v_num_gisela := nextval('pedidos_numero_seq');

  INSERT INTO pedidos (
    numero, cliente_id, cosecha_id, fecha_entrega_id, zona_id,
    tipo_entrega, estado, forma_pago, subtotal, costo_envio, total
  ) VALUES (
    v_num_gisela, v_gisela_id, v_cosecha_id, v_fecha_entrega_id, v_zona_id,
    'retiro', 'pendiente', 'efectivo', 5200, 0, 5200
  ) RETURNING id INTO v_pedido_gisela;

  INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unitario, cantidad, subtotal) VALUES
    (v_pedido_gisela, v_lechuga_mantecosa, 'Lechuga Mantecosa', 2400, 1, 2400),
    (v_pedido_gisela, v_rucula,            'Rúcula',            1400, 2, 2800);

  RAISE NOTICE 'Pedido #% creado para Gisela Piana (id: %)', v_num_gisela, v_pedido_gisela;

  RAISE NOTICE '=== 3 pedidos creados. Números: %, %, % ===',
    v_num_marta, v_num_vanesa, v_num_gisela;

END $$;
