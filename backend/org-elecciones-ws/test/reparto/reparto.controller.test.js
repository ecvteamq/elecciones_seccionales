const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { crearRepartoController } = require('../../controllers/reparto.controller');
const { obtenerMetodoReparto } = require('../../services/reparto/metodo-reparto.factory');

function crearRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

describe('RepartoController', () => {
    let deps;
    let consultaCandidatos;
    let controller;
    const req = {
        body: {
            provincia: '10', canton: '1001', parroquia: '', partido: 'PARTIDO X',
            votosPartido: '900', dignidad: 'CONCEJALES URBANOS',
        },
    };

    beforeEach(() => {
        consultaCandidatos = null;
        deps = {
            Provincia: { findByCodigo: async () => ({ id: 1, nombre: 'IMBABURA' }) },
            Canton: { findByCodigo: async () => ({ id: 2, nombre: 'IBARRA' }) },
            Parroquia: { findByCodigo: async () => { throw new Error('no debería consultarse'); } },
            Candidato: {
                getCandidatosPartido: async (filtro) => {
                    consultaCandidatos = filtro;
                    return [{ nombre: 'B', orden: 2 }, { nombre: 'A', orden: 1 }, { nombre: 'C', orden: 3 }];
                },
            },
            obtenerMetodoReparto,
        };
        controller = crearRepartoController(deps);
    });

    it("calcularReparto usa D'Hondt (método activo)", async () => {
        const res = crearRes();
        await controller.calcularReparto(req, res);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body.map((c) => [c.nombre, c.voto]), [['A', '900.00'], ['B', '450.00'], ['C', '300.00']]);
        assert.deepEqual(consultaCandidatos, {
            dignidad: 'CONCEJALES URBANOS', provincia: 'IMBABURA', canton: 'IBARRA', parroquia: null, partido: 'PARTIDO X', distrito: null,
        });
    });

    it('metodoWebster sigue disponible', async () => {
        const res = crearRes();
        await controller.metodoWebster(req, res);
        assert.deepEqual(res.body.map((c) => c.voto), ['900.00', '300.00', '180.00']);
    });

    it('consulta la parroquia cuando viene en la petición (vocales)', async () => {
        deps.Parroquia.findByCodigo = async () => ({ id: 3, nombre: 'SAN ANTONIO' });
        const res = crearRes();
        await controller.metodoDHondt({ body: { ...req.body, parroquia: '100150' } }, res);
        assert.equal(res.statusCode, 201);
        assert.equal(consultaCandidatos.parroquia, 'SAN ANTONIO');
    });

    it('con distrito filtra candidatos por distrito e ignora la parroquia (concejales)', async () => {
        const res = crearRes();
        await controller.calcularReparto({ body: { ...req.body, parroquia: '100103', distrito: 1 } }, res);
        assert.equal(res.statusCode, 201);
        assert.equal(consultaCandidatos.distrito, 1);
        assert.equal(consultaCandidatos.parroquia, null);
    });

    it('responde 400 si falta el partido', async () => {
        const res = crearRes();
        await controller.calcularReparto({ body: { ...req.body, partido: '' } }, res);
        assert.equal(res.statusCode, 400);
    });

    it('responde 400 si no encuentra la provincia o el cantón', async () => {
        deps.Canton.findByCodigo = async () => null;
        const res = crearRes();
        await controller.calcularReparto(req, res);
        assert.equal(res.statusCode, 400);
    });

    it('responde 501 si falla la base de datos', async () => {
        deps.Candidato.getCandidatosPartido = async () => { throw new Error('db caída'); };
        const res = crearRes();
        await controller.calcularReparto(req, res);
        assert.equal(res.statusCode, 501);
        assert.match(res.body.message, /D'Hondt/);
    });
});
