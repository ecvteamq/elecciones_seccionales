const ValidacionError = require('../errores/validacion.error');
const { construirRecinto, ESTADOS } = require('./recinto-electoral');
const { aRespuestaRecinto } = require('./recinto-electoral.mapper');

/** '' / '  ' / null / undefined -> null; cualquier otro valor -> string recortado. */
const codigoOpcional = (valor) =>
    valor === undefined || valor === null || String(valor).trim() === '' ? null : String(valor).trim();

function exigirUbicacion({ provincia, canton }) {
    const codigoProvincia = codigoOpcional(provincia);
    const codigoCanton = codigoOpcional(canton);
    const faltantes = [];
    if (!codigoProvincia) faltantes.push('provincia es obligatoria');
    if (!codigoCanton) faltantes.push('canton es obligatorio');
    if (faltantes.length) throw new ValidacionError('Debe indicar provincia y cantón', faltantes);
    return { codigoProvincia, codigoCanton };
}

/**
 * Casos de uso de recintos electorales. No conoce SQL ni HTTP:
 * depende únicamente del repositorio inyectado.
 *
 * @param {object} deps
 * @param {ReturnType<import('../../repositories/recinto-electoral.repository').crearRecintoElectoralRepository>} deps.recintoRepository
 */
function crearRecintoElectoralService({ recintoRepository }) {
    return {
        /** Recintos activos de todo el país. */
        async listarActivos() {
            const filas = await recintoRepository.listar({ estados: [ESTADOS.ACTIVO] });
            return filas.map(aRespuestaRecinto);
        },

        /**
         * Recintos activos de un cantón y, opcionalmente, de una parroquia.
         * Recibe los códigos oficiales que envía el frontend.
         */
        async buscarPorUbicacion(filtro = {}) {
            const { codigoProvincia, codigoCanton } = exigirUbicacion(filtro);
            const filas = await recintoRepository.buscarPorUbicacion({
                codigoProvincia,
                codigoCanton,
                codigoParroquia: codigoOpcional(filtro.parroquia),
                estado: ESTADOS.ACTIVO,
            });
            return filas.map(aRespuestaRecinto);
        },

        /** Total de electores habilitados en los recintos activos de un cantón. */
        async contarElectoresPorCanton(filtro = {}) {
            const { codigoProvincia, codigoCanton } = exigirUbicacion(filtro);
            const total = await recintoRepository.sumarElectoresPorCanton({
                codigoProvincia,
                codigoCanton,
                estado: ESTADOS.ACTIVO,
            });
            return { numero_electores: Number(total) || 0 };
        },

        /** Registra un recinto y devuelve su id. */
        async crear(datos) {
            const recinto = construirRecinto(datos);
            return recintoRepository.crear(recinto);
        },
    };
}

module.exports = { crearRecintoElectoralService };
