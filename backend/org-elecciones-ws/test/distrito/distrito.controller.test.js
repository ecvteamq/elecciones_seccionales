const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { crearDistritoController } = require('../../controllers/distrito.controller');

function crearRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

describe('DistritoController', () => {
    let filtroRecibido;
    let repository;
    let controller;

    beforeEach(() => {
        filtroRecibido = null;
        repository = {
            listarPorCanton: async (filtro) => {
                filtroRecibido = filtro;
                return [{ id: 1, nombre: 'CIRCUNSCRIPCIÓN 1', parroquias: [] }];
            },
        };
        controller = crearDistritoController({ distritoRepository: repository });
    });

    it('lista los distritos del cantón filtrando por dignidad', async () => {
        const res = crearRes();
        await controller.getByCanton({ query: { provincia: '10', canton: '1001', dignidad: '3' } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.length, 1);
        assert.deepEqual(filtroRecibido, { codigoProvincia: '10', codigoCanton: '1001', dignidadId: 3 });
    });

    it('sin dignidad no filtra por dignidad', async () => {
        const res = crearRes();
        await controller.getByCanton({ query: { provincia: '10', canton: '1001' } }, res);
        assert.equal(filtroRecibido.dignidadId, null);
    });

    it('responde 400 si falta provincia o cantón', async () => {
        const res = crearRes();
        await controller.getByCanton({ query: { provincia: '10' } }, res);
        assert.equal(res.statusCode, 400);
    });

    it('responde 500 si falla la base de datos', async () => {
        repository.listarPorCanton = async () => { throw new Error('db caída'); };
        const res = crearRes();
        await controller.getByCanton({ query: { provincia: '10', canton: '1001' } }, res);
        assert.equal(res.statusCode, 500);
    });
});
