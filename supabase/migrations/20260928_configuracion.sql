-- Tabla de configuración clave-valor (whatsapp, whatsapp2, etc.)
CREATE TABLE IF NOT EXISTS configuracion (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Admin (autenticado) puede leer y escribir
CREATE POLICY "admin_all_configuracion" ON configuracion
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Clientes anónimos pueden leer (para obtener el número de WhatsApp de destino)
CREATE POLICY "anon_read_configuracion" ON configuracion
  FOR SELECT TO anon USING (true);

-- Valores por defecto
INSERT INTO configuracion (key, value) VALUES
  ('whatsapp', '5491138860680')
ON CONFLICT (key) DO NOTHING;
