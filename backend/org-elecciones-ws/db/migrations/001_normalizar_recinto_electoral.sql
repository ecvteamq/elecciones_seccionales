-- =============================================================================
-- 001 - Normalización de public.recinto_electoral
--
-- Antes: el recinto guardaba provincia/cantón/parroquia como TEXTO
--        (nombre_provincia, nombre_canton, nombre_parroquia) y todos los
--        números como varchar. Los filtros por nombre fallaban ante cualquier
--        diferencia de tildes (p. ej. "FERNANDEZ SALVADOR" vs "FERNÁNDEZ SALVADOR").
-- Después: el recinto referencia a public.parroquia por id (FK) y la jerarquía
--          parroquia -> cantón -> provincia queda garantizada por FKs sobre los
--          códigos oficiales. Los números son enteros con CHECKs.
--
-- La migración es transaccional: si algún recinto no puede asociarse a una
-- parroquia, aborta y no deja cambios a medias.
-- =============================================================================
BEGIN;

-- --- 1. Integridad de la jerarquía geográfica (códigos oficiales) ----------
ALTER TABLE public.provincia ADD CONSTRAINT uq_provincia_codigo UNIQUE (codigo);
ALTER TABLE public.canton    ADD CONSTRAINT uq_canton_codigo    UNIQUE (codigo);
ALTER TABLE public.parroquia ADD CONSTRAINT uq_parroquia_codigo UNIQUE (codigo);

ALTER TABLE public.canton
    ADD CONSTRAINT fk_canton_provincia
    FOREIGN KEY (codigo_provincia) REFERENCES public.provincia (codigo);
ALTER TABLE public.parroquia
    ADD CONSTRAINT fk_parroquia_canton
    FOREIGN KEY (codigo_canton) REFERENCES public.canton (codigo);

-- --- 2. Asociar cada recinto existente a su parroquia ----------------------
CREATE FUNCTION pg_temp.normalizar(texto text) RETURNS text
    LANGUAGE sql IMMUTABLE AS
$$ SELECT upper(trim(translate(texto, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))) $$;

ALTER TABLE public.recinto_electoral ADD COLUMN parroquia_id bigint;

-- Corrección puntual de un nombre mal escrito en los datos heredados.
UPDATE public.recinto_electoral
   SET nombre_parroquia = 'CHITÁN DE NAVARRETE'
 WHERE nombre_parroquia = 'CHITÁN DE NAVARRETES';

UPDATE public.recinto_electoral r
   SET parroquia_id = parr.id
  FROM public.parroquia parr
  JOIN public.canton cant    ON cant.codigo = parr.codigo_canton
  JOIN public.provincia prov ON prov.codigo = cant.codigo_provincia
 WHERE pg_temp.normalizar(prov.nombre) = pg_temp.normalizar(r.nombre_provincia)
   AND pg_temp.normalizar(cant.nombre) = pg_temp.normalizar(r.nombre_canton)
   AND pg_temp.normalizar(parr.nombre) = pg_temp.normalizar(r.nombre_parroquia);

DO $$
DECLARE sin_parroquia text;
BEGIN
    SELECT string_agg(id || ' (' || nombre_canton || ' / ' || nombre_parroquia || ')', ', ')
      INTO sin_parroquia
      FROM public.recinto_electoral
     WHERE parroquia_id IS NULL;
    IF sin_parroquia IS NOT NULL THEN
        RAISE EXCEPTION 'Recintos sin parroquia asociable: %', sin_parroquia;
    END IF;
END $$;

-- --- 3. Nueva estructura del recinto ----------------------------------------
ALTER TABLE public.recinto_electoral RENAME COLUMN nombre_recinto            TO nombre;
ALTER TABLE public.recinto_electoral RENAME COLUMN junta_femenino            TO juntas_femeninas;
ALTER TABLE public.recinto_electoral RENAME COLUMN junta_masculino           TO juntas_masculinas;
ALTER TABLE public.recinto_electoral RENAME COLUMN numero_electores_femenino TO electores_femeninos;
ALTER TABLE public.recinto_electoral RENAME COLUMN numero_electores_masculino TO electores_masculinos;

ALTER TABLE public.recinto_electoral
    ALTER COLUMN nombre               TYPE varchar(255),
    ALTER COLUMN nombre               SET NOT NULL,
    ALTER COLUMN parroquia_id         SET NOT NULL,
    ALTER COLUMN juntas_femeninas     TYPE integer USING NULLIF(trim(juntas_femeninas), '')::integer,
    ALTER COLUMN juntas_masculinas    TYPE integer USING NULLIF(trim(juntas_masculinas), '')::integer,
    ALTER COLUMN total_juntas         TYPE integer USING NULLIF(trim(total_juntas), '')::integer,
    ALTER COLUMN electores_femeninos  TYPE integer USING NULLIF(trim(electores_femeninos), '')::integer,
    ALTER COLUMN electores_masculinos TYPE integer USING NULLIF(trim(electores_masculinos), '')::integer,
    ALTER COLUMN numero_electores     TYPE integer USING NULLIF(trim(numero_electores), '')::integer,
    ALTER COLUMN estado               TYPE varchar(10),
    ALTER COLUMN estado               SET NOT NULL;

ALTER TABLE public.recinto_electoral
    ADD COLUMN codigo                  varchar(20),
    ADD COLUMN direccion               varchar(255),
    ADD COLUMN junta_inicial_femenina  integer,
    ADD COLUMN junta_final_femenina    integer,
    ADD COLUMN junta_inicial_masculina integer,
    ADD COLUMN junta_final_masculina   integer,
    ADD COLUMN fecha_creacion          timestamp NOT NULL DEFAULT now(),
    ADD COLUMN fecha_modificacion      timestamp;

-- Datos derivables que ya no se almacenan (se obtienen por JOIN).
ALTER TABLE public.recinto_electoral
    DROP COLUMN nombre_provincia,
    DROP COLUMN nombre_canton,
    DROP COLUMN nombre_parroquia;

ALTER TABLE public.recinto_electoral
    ADD CONSTRAINT uq_recinto_electoral_codigo UNIQUE (codigo),
    ADD CONSTRAINT fk_recinto_electoral_parroquia
        FOREIGN KEY (parroquia_id) REFERENCES public.parroquia (id),
    ADD CONSTRAINT ck_recinto_electoral_estado
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    ADD CONSTRAINT ck_recinto_electoral_cantidades CHECK (
        coalesce(juntas_femeninas, 0) >= 0 AND coalesce(juntas_masculinas, 0) >= 0
        AND coalesce(total_juntas, 0) >= 0 AND coalesce(numero_electores, 0) >= 0
        AND coalesce(electores_femeninos, 0) >= 0 AND coalesce(electores_masculinos, 0) >= 0),
    ADD CONSTRAINT ck_recinto_electoral_rango_femenino
        CHECK (junta_inicial_femenina IS NULL OR junta_final_femenina IS NULL
               OR junta_inicial_femenina <= junta_final_femenina),
    ADD CONSTRAINT ck_recinto_electoral_rango_masculino
        CHECK (junta_inicial_masculina IS NULL OR junta_final_masculina IS NULL
               OR junta_inicial_masculina <= junta_final_masculina);

CREATE INDEX ix_recinto_electoral_parroquia ON public.recinto_electoral (parroquia_id);

-- --- 4. Quien referencia al recinto, lo hace con FK -------------------------
ALTER TABLE public.acta
    ADD CONSTRAINT fk_acta_recinto_electoral
    FOREIGN KEY (recinto_electoral) REFERENCES public.recinto_electoral (id);
ALTER TABLE seguridad.usuario
    ADD CONSTRAINT fk_usuario_recinto_electoral
    FOREIGN KEY (recinto_electoral) REFERENCES public.recinto_electoral (id);

COMMIT;
