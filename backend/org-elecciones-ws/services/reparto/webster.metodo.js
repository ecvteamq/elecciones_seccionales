const MetodoReparto = require('./metodo-reparto');

/**
 * Método Webster (Sainte-Laguë): divisores impares 1, 3, 5, 7, ...
 */
class WebsterMetodo extends MetodoReparto {
    constructor() {
        super('WEBSTER', 'Webster');
    }

    divisor(indice) {
        return 2 * indice + 1;
    }
}

module.exports = WebsterMetodo;
