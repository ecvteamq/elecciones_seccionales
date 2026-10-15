const MetodoReparto = require('./metodo-reparto');

/**
 * Método D'Hondt: divisores naturales 1, 2, 3, 4, ...
 */
class DHondtMetodo extends MetodoReparto {
    constructor() {
        super('DHONDT', "D'Hondt");
    }

    divisor(indice) {
        return indice + 1;
    }
}

module.exports = DHondtMetodo;
