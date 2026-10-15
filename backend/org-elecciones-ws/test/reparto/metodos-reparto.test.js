const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const MetodoReparto = require('../../services/reparto/metodo-reparto');
const WebsterMetodo = require('../../services/reparto/webster.metodo');
const DHondtMetodo = require('../../services/reparto/dhondt.metodo');
const { obtenerMetodoReparto } = require('../../services/reparto/metodo-reparto.factory');

describe('MetodoReparto (base)', () => {
    it('no se puede instanciar directamente', () => {
        assert.throws(() => new MetodoReparto('X', 'X'), TypeError);
    });

    it('exige que la subclase implemente divisor()', () => {
        class SinDivisor extends MetodoReparto {}
        assert.throws(() => new SinDivisor('X', 'X').calcularCocientes(10, 1), /debe implementar divisor/);
    });

    it('valida votos y cantidad', () => {
        const metodo = new DHondtMetodo();
        assert.throws(() => metodo.calcularCocientes(-1, 2), RangeError);
        assert.throws(() => metodo.calcularCocientes('abc', 2), RangeError);
        assert.throws(() => metodo.calcularCocientes(10, 1.5), RangeError);
        assert.throws(() => metodo.asignarEscanos([], -1), RangeError);
    });
});

describe('WebsterMetodo', () => {
    const webster = new WebsterMetodo();

    it('usa divisores impares 1, 3, 5, 7', () => {
        assert.deepEqual([0, 1, 2, 3].map((i) => webster.divisor(i)), [1, 3, 5, 7]);
    });

    it('calcula cocientes más allá de 50 posiciones (antes daba NaN)', () => {
        const cocientes = webster.calcularCocientes(101, 51);
        assert.equal(cocientes.length, 51);
        assert.equal(cocientes[50], 1);
    });

    it('reparte escaños por Sainte-Laguë', () => {
        const resultado = webster.asignarEscanos([
            { partido: 'A', votos: 53000 },
            { partido: 'B', votos: 24000 },
            { partido: 'C', votos: 23000 },
        ], 7);
        assert.deepEqual(resultado.map((p) => p.escanos), [3, 2, 2]);
    });
});

describe('DHondtMetodo', () => {
    const dhondt = new DHondtMetodo();

    it('usa divisores naturales 1, 2, 3, 4', () => {
        assert.deepEqual([0, 1, 2, 3].map((i) => dhondt.divisor(i)), [1, 2, 3, 4]);
    });

    it('calcula los cocientes de un partido', () => {
        assert.deepEqual(dhondt.calcularCocientes(1200, 4), [1200, 600, 400, 300]);
        assert.deepEqual(dhondt.calcularCocientes(1200, 0), []);
    });

    it('reparte escaños (ejemplo clásico)', () => {
        const resultado = dhondt.asignarEscanos([
            { partido: 'A', votos: 100000 },
            { partido: 'B', votos: 80000 },
            { partido: 'C', votos: 30000 },
            { partido: 'D', votos: 20000 },
        ], 8);
        assert.deepEqual(resultado.map((p) => p.escanos), [4, 3, 1, 0]);
    });

    it('da un resultado distinto a Webster con los mismos votos', () => {
        const partidos = [
            { partido: 'A', votos: 53000 },
            { partido: 'B', votos: 24000 },
            { partido: 'C', votos: 23000 },
        ];
        assert.deepEqual(dhondt.asignarEscanos(partidos, 7).map((p) => p.escanos), [4, 2, 1]);
    });

    it('en empate de cocientes gana el partido con más votos', () => {
        // A: 600, 300 ; B: 300 -> el último escaño empata en 300 y gana A
        const resultado = dhondt.asignarEscanos([
            { partido: 'B', votos: 300 },
            { partido: 'A', votos: 600 },
        ], 2);
        assert.deepEqual(resultado.map((p) => p.escanos), [0, 2]);
    });

    it('no asigna escaños a partidos sin votos', () => {
        const resultado = dhondt.asignarEscanos([
            { partido: 'A', votos: 0 },
            { partido: 'B', votos: 0 },
        ], 3);
        assert.deepEqual(resultado.map((p) => p.escanos), [0, 0]);
    });
});

describe('obtenerMetodoReparto', () => {
    it("por defecto devuelve D'Hondt", () => {
        assert.ok(obtenerMetodoReparto() instanceof DHondtMetodo);
    });

    it('devuelve el método pedido sin importar mayúsculas', () => {
        assert.ok(obtenerMetodoReparto('webster') instanceof WebsterMetodo);
        assert.ok(obtenerMetodoReparto('DHONDT') instanceof DHondtMetodo);
    });

    it('falla con un método desconocido', () => {
        assert.throws(() => obtenerMetodoReparto('HARE'), /no soportado/);
    });
});
