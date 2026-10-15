/**
 * Acceso a datos de public.recinto_electoral (modelo normalizado).
 * Toda la ubicación (parroquia, cantón, provincia) se obtiene por JOIN,
 * nunca se guarda duplicada en el recinto.
 */
const SELECT_RECINTO = `
    SELECT r.id, r.codigo, r.nombre, r.direccion, r.estado,
           r.juntas_femeninas, r.juntas_masculinas, r.total_juntas,
           r.junta_inicial_femenina, r.junta_final_femenina,
           r.junta_inicial_masculina, r.junta_final_masculina,
           r.numero_electores, r.electores_femeninos, r.electores_masculinos,
           parr.id AS parroquia_id, parr.codigo AS parroquia_codigo, parr.nombre AS parroquia_nombre,
           cant.id AS canton_id, cant.codigo AS canton_codigo, cant.nombre AS canton_nombre,
           prov.id AS provincia_id, prov.codigo AS provincia_codigo, prov.nombre AS provincia_nombre
      FROM public.recinto_electoral r
      JOIN public.parroquia parr ON parr.id = r.parroquia_id
      JOIN public.canton cant    ON cant.codigo = parr.codigo_canton
      JOIN public.provincia prov ON prov.codigo = cant.codigo_provincia`;

const ORDEN = 'ORDER BY prov.nombre, cant.nombre, parr.nombre, r.nombre';

/**
 * @param {import('pg-promise').IDatabase<any>} db
 */
function crearRecintoElectoralRepository(db) {
    return {
        /** @param {{estados: string[]}} filtro */
        listar({ estados }) {
            return db.manyOrNone(`${SELECT_RECINTO} WHERE r.estado IN ($1:csv) ${ORDEN}`, [estados]);
        },

        buscarPorUbicacion({ codigoProvincia, codigoCanton, codigoParroquia, estado }) {
            return db.manyOrNone(
                `${SELECT_RECINTO}
                 WHERE prov.codigo = $1 AND cant.codigo = $2
                   AND ($3::varchar IS NULL OR parr.codigo = $3)
                   AND r.estado = $4
                 ${ORDEN}`,
                [codigoProvincia, codigoCanton, codigoParroquia, estado],
            );
        },

        async sumarElectoresPorCanton({ codigoProvincia, codigoCanton, estado }) {
            const fila = await db.one(
                `SELECT COALESCE(SUM(r.numero_electores), 0)::integer AS total
                   FROM public.recinto_electoral r
                   JOIN public.parroquia parr ON parr.id = r.parroquia_id
                   JOIN public.canton cant    ON cant.codigo = parr.codigo_canton
                  WHERE cant.codigo_provincia = $1 AND cant.codigo = $2 AND r.estado = $3`,
                [codigoProvincia, codigoCanton, estado],
            );
            return fila.total;
        },

        obtenerPorId(id) {
            return db.oneOrNone(`${SELECT_RECINTO} WHERE r.id = $1`, [id]);
        },

        async crear(recinto) {
            const fila = await db.one(
                `INSERT INTO public.recinto_electoral (
                     codigo, nombre, direccion, parroquia_id, estado,
                     juntas_femeninas, juntas_masculinas, total_juntas,
                     junta_inicial_femenina, junta_final_femenina,
                     junta_inicial_masculina, junta_final_masculina,
                     numero_electores, electores_femeninos, electores_masculinos)
                 VALUES (
                     $<codigo>, $<nombre>, $<direccion>, $<parroquia_id>, $<estado>,
                     $<juntas_femeninas>, $<juntas_masculinas>, $<total_juntas>,
                     $<junta_inicial_femenina>, $<junta_final_femenina>,
                     $<junta_inicial_masculina>, $<junta_final_masculina>,
                     $<numero_electores>, $<electores_femeninos>, $<electores_masculinos>)
                 RETURNING id`,
                recinto,
            );
            return Number(fila.id);
        },
    };
}

module.exports = { crearRecintoElectoralRepository };
