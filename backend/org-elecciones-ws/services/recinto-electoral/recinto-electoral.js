const ValidacionError = require('../errores/validacion.error');

const ESTADOS = Object.freeze({ ACTIVO: 'ACTIVO', INACTIVO: 'INACTIVO' });

const CAMPOS_ENTEROS = [
    'juntas_femeninas',
    'juntas_masculinas',
    'total_juntas',
    'junta_inicial_femenina',
    'junta_final_femenina',
    'junta_inicial_masculina',
    'junta_final_masculina',
    'numero_electores',
    'electores_femeninos',
    'electores_masculinos',
];

const vacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';

/** Convierte a entero >= 0; null si viene vacío; registra el error si no es válido. */
function aEnteroNoNegativo(valor, campo, errores) {
    if (vacio(valor)) return null;
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 0) {
        errores.push(`${campo} debe ser un entero mayor o igual a 0`);
        return null;
    }
    return numero;
}

function validarRango(recinto, inicial, final, errores) {
    if (recinto[inicial] !== null && recinto[final] !== null && recinto[inicial] > recinto[final]) {
        errores.push(`${inicial} no puede ser mayor que ${final}`);
    }
}

/**
 * Valida y normaliza los datos de un recinto electoral nuevo.
 * Regla: si no se informa total_juntas, se calcula como femeninas + masculinas.
 *
 * @param {object} datos
 * @returns {object} recinto listo para persistir
 * @throws {ValidacionError}
 */
function construirRecinto(datos = {}) {
    const errores = [];

    const nombre = vacio(datos.nombre) ? '' : String(datos.nombre).trim();
    if (!nombre) errores.push('nombre es obligatorio');

    const parroquiaId = Number(datos.parroquia_id);
    if (vacio(datos.parroquia_id) || !Number.isInteger(parroquiaId) || parroquiaId <= 0) {
        errores.push('parroquia_id es obligatorio');
    }

    const estado = vacio(datos.estado) ? ESTADOS.ACTIVO : String(datos.estado).trim().toUpperCase();
    if (!Object.values(ESTADOS).includes(estado)) {
        errores.push(`estado debe ser ${Object.values(ESTADOS).join(' o ')}`);
    }

    const recinto = {
        codigo: vacio(datos.codigo) ? null : String(datos.codigo).trim(),
        nombre,
        direccion: vacio(datos.direccion) ? null : String(datos.direccion).trim(),
        parroquia_id: parroquiaId,
        estado,
    };
    for (const campo of CAMPOS_ENTEROS) {
        recinto[campo] = aEnteroNoNegativo(datos[campo], campo, errores);
    }

    if (recinto.total_juntas === null
        && (recinto.juntas_femeninas !== null || recinto.juntas_masculinas !== null)) {
        recinto.total_juntas = (recinto.juntas_femeninas || 0) + (recinto.juntas_masculinas || 0);
    }
    validarRango(recinto, 'junta_inicial_femenina', 'junta_final_femenina', errores);
    validarRango(recinto, 'junta_inicial_masculina', 'junta_final_masculina', errores);

    if (errores.length) {
        throw new ValidacionError('Datos del recinto electoral inválidos', errores);
    }
    return recinto;
}

module.exports = { construirRecinto, ESTADOS, CAMPOS_ENTEROS };
