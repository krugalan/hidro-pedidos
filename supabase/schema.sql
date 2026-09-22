-- ============================================================
-- Hidro Pedidos — Schema Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Sequence para número de pedido legible, comenzando en 100
CREATE SEQUENCE IF NOT EXISTS pedidos_numero_seq START 100;

-- ------------------------------------------------------------
-- Zonas (barrios/sectores de entrega)
-- ------------------------------------------------------------
CREATE TABLE zonas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Clientes
-- ------------------------------------------------------------
CREATE TABLE clientes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  whatsapp    TEXT,
  email       TEXT        UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Direcciones (cada cliente puede tener varias, ligadas a una zona)
-- ------------------------------------------------------------
CREATE TABLE direcciones (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID        REFERENCES clientes(id) ON DELETE SET NULL,
  zona_id     UUID        REFERENCES zonas(id)    ON DELETE SET NULL,
  calle       TEXT        NOT NULL,
  detalle     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Productos (espejo de config.ts — permite override por fila)
-- ------------------------------------------------------------
CREATE TABLE productos (
  id                TEXT        PRIMARY KEY,
  nombre            TEXT        NOT NULL,
  detalle           TEXT,
  precio            INTEGER     NOT NULL,
  emoji             TEXT,
  max_por_producto  INTEGER     NOT NULL DEFAULT 10,
  activo            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Cosechas (cada tanda/ciclo de producción)
-- ------------------------------------------------------------
CREATE TABLE cosechas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  descripcion TEXT,
  activa      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Cosecha Items (qué productos incluye cada cosecha y en qué cantidad)
-- ------------------------------------------------------------
CREATE TABLE cosecha_items (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cosecha_id         UUID        NOT NULL REFERENCES cosechas(id)  ON DELETE CASCADE,
  producto_id        TEXT        REFERENCES productos(id),
  cantidad_estimada  INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Fechas de Entrega (cada cosecha puede tener múltiples fechas)
-- ------------------------------------------------------------
CREATE TABLE fechas_entrega (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cosecha_id  UUID        NOT NULL REFERENCES cosechas(id) ON DELETE CASCADE,
  fecha       DATE        NOT NULL,
  hora_inicio TIME,
  hora_fin    TIME,
  activa      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Pedidos
-- ------------------------------------------------------------
CREATE TABLE pedidos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero           INTEGER     NOT NULL DEFAULT nextval('pedidos_numero_seq'),
  cliente_id       UUID        REFERENCES clientes(id)        ON DELETE SET NULL,
  direccion_id     UUID        REFERENCES direcciones(id)     ON DELETE SET NULL,
  cosecha_id       UUID        REFERENCES cosechas(id)        ON DELETE SET NULL,
  fecha_entrega_id UUID        REFERENCES fechas_entrega(id)  ON DELETE SET NULL,
  tipo_entrega     TEXT        NOT NULL CHECK (tipo_entrega IN ('domicilio', 'retiro')),
  estado           TEXT        NOT NULL DEFAULT 'pendiente'
                               CHECK (estado IN ('pendiente','confirmado','entregado','cancelado')),
  notas            TEXT,
  subtotal         INTEGER     NOT NULL,
  costo_envio      INTEGER     NOT NULL DEFAULT 0,
  total            INTEGER     NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para listar pedidos por número descendente
CREATE UNIQUE INDEX pedidos_numero_idx ON pedidos(numero);

-- ------------------------------------------------------------
-- Pedido Items (snapshot de precio al momento del pedido)
-- ------------------------------------------------------------
CREATE TABLE pedido_items (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id        UUID    NOT NULL REFERENCES pedidos(id)  ON DELETE CASCADE,
  producto_id      TEXT    REFERENCES productos(id),
  nombre           TEXT    NOT NULL,
  precio_unitario  INTEGER NOT NULL,
  cantidad         INTEGER NOT NULL,
  subtotal         INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Row Level Security (activar; políticas a definir en prod)
-- ------------------------------------------------------------
ALTER TABLE pedidos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones ENABLE ROW LEVEL SECURITY;

-- Política temporal: solo usuarios autenticados (admin) pueden leer/escribir todo
CREATE POLICY "admin_all_pedidos"    ON pedidos    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_clientes"   ON clientes   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_direcciones" ON direcciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- Datos de ejemplo — Zonas
-- ------------------------------------------------------------
INSERT INTO zonas (nombre) VALUES
  ('Centro'),
  ('Zona Hospital'),
  ('Ostende'),
  ('Valeria del Mar'),
  ('Cariló');
