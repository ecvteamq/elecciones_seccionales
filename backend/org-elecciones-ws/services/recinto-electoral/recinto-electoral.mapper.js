const { CAMPOS_ENTEROS } = require('./recinto-electoral');

/**
 * Traduce una fila del repositorio (recinto + parroquia + cantón + provincia)
 * al contrato JSON que consume el frontend.
 *
 * Además de los campos normalizados, se exponen los nombres que el frontend
 * ya utilizaba (nombre_recinto, direccion_recinto, nombre_provincia,
 * nombre_canton, nombre_parroquia, junta_femenino, junta_masculino) para no
 * romper las pantallas existentes.
 */
function aRespuestaRecinto(fila) {
    if (!fila) return null;

    const respuesta = {
        id: Number(fila.id),
        codigo: fila.codigo,
        nombre: fila.nombre,
        direccion: fila.direccion,
        estado: fila.estado,
        parroquia: { id: Number(fila.parroquia_id), codigo: fila.parroquia_codigo, nombre: fila.parroquia_nombre },
        canton: { id: Number(fila.canton_id), codigo: fila.canton_codigo, nombre: fila.canton_nombre },
        provincia: { id: Number(fila.provincia_id), codigo: fila.provincia_codigo, nombre: fila.provincia_nombre },
    };
    for (const campo of CAMPOS_ENTEROS) {
        respuesta[campo] = fila[campo] === null || fila[campo] === undefined ? null : Number(fila[campo]);
    }

    // Compatibilidad con el contrato anterior.
    respuesta.nombre_recinto = fila.nombre;
    respuesta.direccion_recinto = fila.direccion;
    respuesta.nombre_provincia = fila.provincia_nombre;
    respuesta.nombre_canton = fila.canton_nombre;
    respuesta.nombre_parroquia = fila.parroquia_nombre;
    respuesta.junta_femenino = respuesta.juntas_femeninas;
    respuesta.junta_masculino = respuesta.juntas_masculinas;

    return respuesta;
}

module.exports = { aRespuestaRecinto };
