-- Tabla join: zonas disponibles por fecha de entrega
-- Por defecto ninguna zona está asignada a una fecha (el admin las activa explícitamente)
CREATE TABLE fecha_entrega_zonas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_entrega_id UUID REFERENCES fechas_entrega(id) ON DELETE CASCADE NOT NULL,
  zona_id UUID REFERENCES zonas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fecha_entrega_id, zona_id)
);

ALTER TABLE fecha_entrega_zonas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON fecha_entrega_zonas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon read" ON fecha_entrega_zonas
  FOR SELECT TO anon USING (true);
