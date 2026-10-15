const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { crearRecintoElectoralController } = require('../../controllers/recinto_electoral.controller');
const ValidacionError = require('../../services/errores/validacion.error');

function crearRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

describe('RecintoElectoralController', () => {
    let service;
    let controller;

    beforeEach(() => {
        service = {
            listarActivos: async () => [{ id: 1 }],
            buscarPorUbicacion: async (filtro) => [{ id: 2, filtro }],
            contarElectoresPorCanton: async () => ({ numero_electores: 10 }),
            crear: async () => 7,
        };
        controller = crearRecintoElectoralController({ recintoService: service });
    });

    it('getAll responde 200 con la lista', async () => {
        const res = crearRes();
        await controller.getAll({}, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, [{ id: 1 }]);
    });

    it('getByFilter pasa el body al servicio', async () => {
        const res = crearRes();
        const body = { provincia: '10', canton: '1001', parroquia: '' };
        await controller.getByFilter({ body }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body[0].filtro, body);
    });

    it('getNumeroElectoresByCanton responde el total', async () => {
        const res = crearRes();
        await controller.getNumeroElectoresByCanton({ body: {} }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { numero_electores: 10 });
    });

    it('create responde 201 con el id', async () => {
        const res = crearRes();
        await controller.create({ body: { nombre: 'X' } }, res);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, { success: true, message: 'El registro se realizo correctamente', data: 7 });
    });

    it('traduce ValidacionError a 400 con el detalle', async () => {
        service.crear = async () => { throw new ValidacionError('Datos inválidos', ['nombre es obligatorio']); };
        const res = crearRes();
        await controller.create({ body: {} }, res);
        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.body, { success: false, message: 'Datos inválidos', errors: ['nombre es obligatorio'] });
    });

    it('traduce errores inesperados a 500 sin filtrar detalles internos', async () => {
        service.listarActivos = async () => { throw new Error('connection refused'); };
        const res = crearRes();
        const log = console.log;
        console.log = () => {};
        try {
            await controller.getAll({}, res);
        } finally {
            console.log = log;
        }
        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { success: false, message: 'Error al obtener los recintos electorales' });
    });
});
