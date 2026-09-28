-- ============================================================
-- Seed: Productos Hidro Pinamar
-- Ejecutar en el SQL Editor de Supabase
-- Es idempotente: se puede correr más de una vez sin duplicar.
-- ============================================================
--
-- PRECIOS SIN DEFINIR → aparecen como 0.
-- Actualizarlos desde el panel admin en /admin/productos
-- ============================================================

INSERT INTO productos (id, nombre, detalle, precio, emoji, max_por_producto, activo) VALUES

  -- ── Rúcula ─────────────────────────────────────────────────
  ('rucula',
   'Rúcula',
   'Hojas frescas con sabor picante y aromático. Ideal para ensaladas.',
   1400,
   '🥬',
   5,
   true),

  -- ── Lechugas ───────────────────────────────────────────────
  ('lechuga-mantecosa',
   'Lechuga Mantecosa',
   'Hojas tiernas y suaves, textura mantecosa. Perfecta para ensaladas.',
   2400,
   '🌿',
   5,
   true),

  ('lechuga-crespa',
   'Lechuga Crespa',
   'Hojas crespas y crujientes, muy fresca y crocante.',
   2400,
   '🌱',
   5,
   true),

  ('lechuga-morada',
   'Lechuga Morada',
   'Hojas moradas, ricas en antioxidantes. Suma color a tus platos.',
   2400,
   '🫐',
   5,
   false),  -- no disponible

  -- ── Hierbas ────────────────────────────────────────────────
  ('perejil',
   'Perejil',
   'Fresco y aromático, infaltable en la cocina.',
   0,         -- ← actualizar precio
   '🌿',
   3,
   true),

  ('albahaca',
   'Albahaca',
   'Aromática y versátil. Ideal para salsas, pestos e infusiones.',
   0,         -- ← actualizar precio
   '🍃',
   3,
   false),   -- no disponible

  ('menta',
   'Menta',
   'Fresca e intensa. Perfecta para bebidas, postres y ensaladas.',
   0,         -- ← actualizar precio
   '🍃',
   3,
   true),

  ('apio',
   'Apio',
   'Crujiente y nutritivo, rico en fibra y minerales.',
   0,         -- ← actualizar precio
   '🌿',
   3,
   false),   -- no disponible

  -- ── Microgreens (disponibles en noviembre) ─────────────────
  ('microgreen-rucula',
   'Microgreen Rúcula',
   'Brotes tiernos de rúcula. Máxima concentración de sabor y nutrientes.',
   0,         -- ← actualizar precio
   '🌱',
   3,
   false),

  ('microgreen-remolacha',
   'Microgreen Remolacha',
   'Brotes de remolacha con un toque dulce y terroso.',
   0,         -- ← actualizar precio
   '🌱',
   3,
   false),

  ('microgreen-arveja',
   'Microgreen Arveja',
   'Brotes suaves y dulces de arveja, perfectos en ensaladas y sandwiches.',
   0,         -- ← actualizar precio
   '🌱',
   3,
   false),

  ('microgreen-eneldo',
   'Microgreen Eneldo',
   'Brotes aromáticos de eneldo, ideales para acompañar pescados y salsas.',
   0,         -- ← actualizar precio
   '🌱',
   3,
   false),

  ('microgreen-cilantro',
   'Microgreen Cilantro',
   'Brotes intensos de cilantro, perfectos para dar un toque fresco y cítrico.',
   0,         -- ← actualizar precio
   '🌱',
   3,
   false)

ON CONFLICT (id) DO UPDATE SET
  nombre           = EXCLUDED.nombre,
  detalle          = EXCLUDED.detalle,
  precio           = CASE WHEN productos.precio = 0 THEN EXCLUDED.precio ELSE productos.precio END,
  emoji            = EXCLUDED.emoji,
  max_por_producto = EXCLUDED.max_por_producto,
  activo           = EXCLUDED.activo;

-- Verificar resultado
SELECT id, nombre, precio, activo FROM productos ORDER BY
  CASE
    WHEN id LIKE 'microgreen%' THEN 3
    WHEN id LIKE 'lechuga%'    THEN 2
    ELSE 1
  END,
  nombre;
