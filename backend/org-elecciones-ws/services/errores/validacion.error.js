/**
 * Error de reglas de negocio / datos de entrada inválidos.
 * Los controladores lo traducen a HTTP 400.
 */
class ValidacionError extends Error {
    /**
     * @param {string} message
     * @param {string[]} [detalles] lista de problemas encontrados
     */
    constructor(message, detalles = []) {
        super(message);
        this.name = 'ValidacionError';
        this.detalles = detalles;
    }
}

module.exports = ValidacionError;
