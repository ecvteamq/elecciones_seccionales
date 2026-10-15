const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { aRespuestaRecinto } = require('../../services/recinto-electoral/recinto-electoral.mapper');

// Así llega una fila desde pg-promise (bigint como string).
const fila = {
    id: '19', codigo: '1440', nombre: 'UE Atahualpa', direccion: 'Río Tiputini 6-63', estado: 'ACTIVO',
    juntas_femeninas: 7, juntas_masculinas: 6, total_juntas: 13,
    junta_inicial_femenina: 11, junta_final_femenina: 17,
    junta_inicial_masculina: 11, junta_final_masculina: 16,
    numero_electores: 4550, electores_femeninos: null, electores_masculinos: null,
    parroquia_id: '607', parroquia_codigo: '100101', parroquia_nombre: 'CARANQUI',
    canton_id: '100', canton_codigo: '1001', canton_nombre: 'IBARRA',
    provincia_id: '10', provincia_codigo: '10', provincia_nombre: 'IMBABURA',
};

describe('aRespuestaRecinto', () => {
    it('devuelve null si no hay fila', () => {
        assert.equal(aRespuestaRecinto(null), null);
    });

    it('expone el modelo normalizado con la ubicación anidada', () => {
        const r = aRespuestaRecinto(fila);
        assert.equal(r.id, 19);
        assert.equal(r.total_juntas, 13);
        assert.equal(r.electores_femeninos, null);
        assert.deepEqual(r.parroquia, { id: 607, codigo: '100101', nombre: 'CARANQUI' });
        assert.deepEqual(r.canton, { id: 100, codigo: '1001', nombre: 'IBARRA' });
        assert.deepEqual(r.provincia, { id: 10, codigo: '10', nombre: 'IMBABURA' });
    });

    it('mantiene los campos que usa el frontend actual', () => {
        const r = aRespuestaRecinto(fila);
        assert.equal(r.nombre_recinto, 'UE Atahualpa');
        assert.equal(r.direccion_recinto, 'Río Tiputini 6-63');
        assert.equal(r.nombre_provincia, 'IMBABURA');
        assert.equal(r.nombre_canton, 'IBARRA');
        assert.equal(r.nombre_parroquia, 'CARANQUI');
        assert.equal(r.junta_femenino, 7);
        assert.equal(r.junta_masculino, 6);
        assert.equal(r.numero_electores, 4550);
        assert.equal(r.estado, 'ACTIVO');
    });
});
