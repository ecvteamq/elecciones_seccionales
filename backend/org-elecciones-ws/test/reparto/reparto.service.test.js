const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { calcularVotosCandidatos, ordenarPorPosicion } = require('../../services/reparto/reparto.service');
const WebsterMetodo = require('../../services/reparto/webster.metodo');
const DHondtMetodo = require('../../services/reparto/dhondt.metodo');

const candidatos = [
    { nombre: 'Tercero', orden: '3' },
    { nombre: 'Primero', orden: 1 },
    { nombre: 'Segundo', orden: '2' },
];

describe('ordenarPorPosicion', () => {
    it('ordena numéricamente y deja al final los que no tienen orden', () => {
        const ordenados = ordenarPorPosicion([
            { nombre: 'sin', orden: null },
            { nombre: 'diez', orden: '10' },
            { nombre: 'dos', orden: '2' },
        ]);
        assert.deepEqual(ordenados.map((c) => c.nombre), ['dos', 'diez', 'sin']);
    });

    it('no modifica el arreglo original', () => {
        const copia = [...candidatos];
        ordenarPorPosicion(candidatos);
        assert.deepEqual(candidatos, copia);
    });
});

describe('calcularVotosCandidatos', () => {
    it("asigna los cocientes D'Hondt según el orden de la lista", () => {
        const resultado = calcularVotosCandidatos(new DHondtMetodo(), '1200', candidatos);
        assert.deepEqual(resultado.map((c) => [c.nombre, c.voto]), [
            ['Primero', '1200.00'],
            ['Segundo', '600.00'],
            ['Tercero', '400.00'],
        ]);
    });

    it('asigna los cocientes Webster según el orden de la lista', () => {
        const resultado = calcularVotosCandidatos(new WebsterMetodo(), 1200, candidatos);
        assert.deepEqual(resultado.map((c) => c.voto), ['1200.00', '400.00', '240.00']);
    });

    it('devuelve lista vacía si no hay candidatos', () => {
        assert.deepEqual(calcularVotosCandidatos(new DHondtMetodo(), 100, []), []);
        assert.deepEqual(calcularVotosCandidatos(new DHondtMetodo(), 100, null), []);
    });
});
