-- =============================================================================
-- Distritos (circunscripciones) de concejales del cantón IBARRA - Seccionales 2027
-- Fuente: matriz de candidatos entregada por el cliente
--   - CIRCUNSCRIPCIÓN 1: Sagrario, Guayaquil de Alpachaca, La Dolorosa del Priorato (4 concejales)
--   - CIRCUNSCRIPCIÓN 2: Caranqui, San Francisco (5 concejales)
--   - RURAL: parroquias rurales del cantón (2 concejales)
-- Idempotente: se puede ejecutar varias veces.
-- Requiere: db/migrations/003_distritos.sql
-- =============================================================================
BEGIN;

INSERT INTO public.distrito (codigo_canton, dignidad_id, nombre, escanos)
SELECT '1001', dig.id, d.nombre, d.escanos
  FROM (VALUES
    ('CONCEJALES URBANOS', 'CIRCUNSCRIPCIÓN 1', 4),
    ('CONCEJALES URBANOS', 'CIRCUNSCRIPCIÓN 2', 5),
    ('CONCEJALES RURALES', 'CIRCUNSCRIPCIÓN RURAL', 2)
  ) AS d (dignidad, nombre, escanos)
  JOIN public.dignidad dig ON dig.descripcion = d.dignidad
ON CONFLICT (codigo_canton, dignidad_id, nombre) DO UPDATE SET escanos = EXCLUDED.escanos;

INSERT INTO public.distrito_parroquia (distrito_id, parroquia_id)
SELECT dis.id, parr.id
  FROM (VALUES
    ('CIRCUNSCRIPCIÓN 1', '100103'),     -- SAGRARIO
    ('CIRCUNSCRIPCIÓN 1', '100102'),     -- GUAYAQUIL DE ALPACHACA
    ('CIRCUNSCRIPCIÓN 1', '100105'),     -- LA DOLOROSA DEL PRIORATO
    ('CIRCUNSCRIPCIÓN 2', '100101'),     -- CARANQUI
    ('CIRCUNSCRIPCIÓN 2', '100104'),     -- SAN FRANCISCO
    ('CIRCUNSCRIPCIÓN RURAL', '100151'), -- AMBUQUI/CHOTA
    ('CIRCUNSCRIPCIÓN RURAL', '100152'), -- ANGOCHAGUA
    ('CIRCUNSCRIPCIÓN RURAL', '100153'), -- CAROLINA
    ('CIRCUNSCRIPCIÓN RURAL', '100154'), -- LA ESPERANZA
    ('CIRCUNSCRIPCIÓN RURAL', '100155'), -- LITA
    ('CIRCUNSCRIPCIÓN RURAL', '100156'), -- SALINAS
    ('CIRCUNSCRIPCIÓN RURAL', '100157')  -- SAN ANTONIO
  ) AS m (distrito, codigo_parroquia)
  JOIN public.distrito dis   ON dis.codigo_canton = '1001' AND dis.nombre = m.distrito
  JOIN public.parroquia parr ON parr.codigo = m.codigo_parroquia
ON CONFLICT DO NOTHING;

COMMIT;
