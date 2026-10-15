const WebsterMetodo = require('./webster.metodo');
const DHondtMetodo = require('./dhondt.metodo');
const { METODO_REPARTO_ACTIVO } = require('../../config/reparto.config');

/** Registro de métodos disponibles. Para agregar uno nuevo basta con registrarlo aquí. */
const METODOS = {
    WEBSTER: new WebsterMetodo(),
    DHONDT: new DHondtMetodo(),
};

/**
 * Devuelve el método de reparto solicitado o, si no se indica, el activo
 * en la configuración.
 * @param {string} [codigo]
 */
function obtenerMetodoReparto(codigo = METODO_REPARTO_ACTIVO) {
    const metodo = METODOS[String(codigo).toUpperCase()];
    if (!metodo) {
        throw new Error(`Método de reparto no soportado: ${codigo}`);
    }
    return metodo;
}

module.exports = { obtenerMetodoReparto, METODOS };
