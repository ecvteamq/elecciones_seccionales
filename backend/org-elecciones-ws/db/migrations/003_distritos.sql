-- =============================================================================
-- 003 - Distritos (circunscripciones electorales)
--
-- Las dignidades multipersonales de concejales se eligen "en grupo y por
-- distrito": un cantón se divide en circunscripciones urbanas (cada una agrupa
-- varias parroquias urbanas y elige N concejales) y una circunscripción rural.
--
--   distrito            -> circunscripción de un cantón para una dignidad.
--   distrito_parroquia  -> parroquias que componen cada distrito.
--   candidato.distrito_id -> distrito por el que participa el candidato.
--
-- Requiere: db/migrations/001_normalizar_recinto_electoral.sql
-- =============================================================================
BEGIN;

CREATE TABLE public.distrito (
    id                 bigserial    PRIMARY KEY,
    codigo_canton      varchar      NOT NULL REFERENCES public.canton (codigo),
    dignidad_id        bigint       NOT NULL REFERENCES public.dignidad (id),
    nombre             varchar(100) NOT NULL,
    escanos            integer      CHECK (escanos IS NULL OR escanos > 0),
    estado             varchar(10)  NOT NULL DEFAULT 'ACTIVO'
                                    CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    fecha_creacion     timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT uq_distrito_canton_dignidad_nombre UNIQUE (codigo_canton, dignidad_id, nombre)
);

CREATE TABLE public.distrito_parroquia (
    distrito_id  bigint NOT NULL REFERENCES public.distrito (id) ON DELETE CASCADE,
    parroquia_id bigint NOT NULL REFERENCES public.parroquia (id),
    PRIMARY KEY (distrito_id, parroquia_id)
);

CREATE INDEX ix_distrito_parroquia_parroquia ON public.distrito_parroquia (parroquia_id);

ALTER TABLE public.candidato
    ADD COLUMN distrito_id bigint REFERENCES public.distrito (id);

CREATE INDEX ix_candidato_distrito ON public.candidato (distrito_id);

COMMIT;
