/**
 * Acceso a datos de public.distrito (circunscripciones electorales).
 * Cada distrito pertenece a un cantón y a una dignidad, y agrupa parroquias
 * a través de public.distrito_parroquia.
 */
const SELECT_DISTRITO = `
    SELECT d.id, d.nombre, d.escanos, d.estado, d.codigo_canton, d.dignidad_id,
           COALESCE(
               json_agg(json_build_object('id', parr.id, 'codigo', parr.codigo, 'nombre', parr.nombre)
                        ORDER BY parr.nombre) FILTER (WHERE parr.id IS NOT NULL),
               '[]') AS parroquias
      FROM public.distrito d
      JOIN public.canton cant ON cant.codigo = d.codigo_canton
      LEFT JOIN public.distrito_parroquia dp ON dp.distrito_id = d.id
      LEFT JOIN public.parroquia parr ON parr.id = dp.parroquia_id`;

const AGRUPAR = 'GROUP BY d.id ORDER BY d.nombre';

/**
 * @param {import('pg-promise').IDatabase<any>} db
 */
function crearDistritoRepository(db) {
    return {
        /** Distritos activos de un cantón; si se indica dignidad, solo los de esa dignidad. */
        listarPorCanton({ codigoProvincia, codigoCanton, dignidadId }) {
            return db.manyOrNone(
                `${SELECT_DISTRITO}
                 WHERE cant.codigo_provincia = $1 AND d.codigo_canton = $2
                   AND ($3::bigint IS NULL OR d.dignidad_id = $3)
                   AND d.estado = 'ACTIVO'
                 ${AGRUPAR}`,
                [codigoProvincia, codigoCanton, dignidadId],
            );
        },

        obtenerPorId(id) {
            return db.oneOrNone(`${SELECT_DISTRITO} WHERE d.id = $1 GROUP BY d.id`, [id]);
        },

        /** Distrito de la dignidad al que pertenece una parroquia (por código). */
        buscarPorParroquia({ codigoParroquia, dignidadId }) {
            return db.oneOrNone(
                `SELECT d.id, d.nombre, d.escanos
                   FROM public.distrito d
                   JOIN public.distrito_parroquia dp ON dp.distrito_id = d.id
                   JOIN public.parroquia parr ON parr.id = dp.parroquia_id
                  WHERE parr.codigo = $1 AND d.dignidad_id = $2 AND d.estado = 'ACTIVO'`,
                [codigoParroquia, dignidadId],
            );
        },
    };
}

module.exports = { crearDistritoRepository };
