const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { construirRecinto } = require('../../services/recinto-electoral/recinto-electoral');
const ValidacionError = require('../../services/errores/validacion.error');

const valido = () => ({
    nombre: '  UE Atahualpa ',
    parroquia_id: 607,
    juntas_femeninas: 7,
    juntas_masculinas: '6',
    junta_inicial_femenina: 11,
    junta_final_femenina: 17,
    junta_inicial_masculina: 11,
    junta_final_masculina: 16,
    numero_electores: '4550',
});

function erroresDe(datos) {
    try {
        construirRecinto(datos);
    } catch (error) {
        assert.ok(error instanceof ValidacionError);
        return error.detalles;
    }
    assert.fail('se esperaba ValidacionError');
}

describe('construirRecinto (dominio)', () => {
    it('normaliza textos, convierte números y aplica valores por defecto', () => {
        const recinto = construirRecinto(valido());
        assert.equal(recinto.nombre, 'UE Atahualpa');
        assert.equal(recinto.parroquia_id, 607);
        assert.equal(recinto.juntas_masculinas, 6);
        assert.equal(recinto.numero_electores, 4550);
        assert.equal(recinto.estado, 'ACTIVO');
        assert.equal(recinto.codigo, null);
        assert.equal(recinto.direccion, null);
        assert.equal(recinto.electores_femeninos, null);
    });

    it('calcula total_juntas cuando no se informa', () => {
        assert.equal(construirRecinto(valido()).total_juntas, 13);
    });

    it('respeta total_juntas cuando se informa', () => {
        assert.equal(construirRecinto({ ...valido(), total_juntas: 20 }).total_juntas, 20);
    });

    it('deja total_juntas en null si no hay ningún dato de juntas', () => {
        const recinto = construirRecinto({ nombre: 'X', parroquia_id: 1 });
        assert.equal(recinto.total_juntas, null);
    });

    it('acepta estado INACTIVO sin importar mayúsculas', () => {
        assert.equal(construirRecinto({ ...valido(), estado: 'inactivo' }).estado, 'INACTIVO');
    });

    it('exige nombre y parroquia', () => {
        const errores = erroresDe({ nombre: '   ', parroquia_id: '' });
        assert.deepEqual(errores, ['nombre es obligatorio', 'parroquia_id es obligatorio']);
    });

    it('rechaza parroquia_id no positivo o no entero', () => {
        assert.deepEqual(erroresDe({ ...valido(), parroquia_id: 0 }), ['parroquia_id es obligatorio']);
        assert.deepEqual(erroresDe({ ...valido(), parroquia_id: 'abc' }), ['parroquia_id es obligatorio']);
    });

    it('rechaza estados desconocidos', () => {
        assert.deepEqual(erroresDe({ ...valido(), estado: 'BORRADO' }), ['estado debe ser ACTIVO o INACTIVO']);
    });

    it('rechaza cantidades negativas o decimales', () => {
        const errores = erroresDe({ ...valido(), numero_electores: -1, juntas_femeninas: 1.5 });
        assert.deepEqual(errores, [
            'juntas_femeninas debe ser un entero mayor o igual a 0',
            'numero_electores debe ser un entero mayor o igual a 0',
        ]);
    });

    it('rechaza rangos de juntas invertidos', () => {
        const errores = erroresDe({ ...valido(), junta_inicial_masculina: 20, junta_final_masculina: 16 });
        assert.deepEqual(errores, ['junta_inicial_masculina no puede ser mayor que junta_final_masculina']);
    });
});
