/**
 * Prueba de integración contra una base PostgreSQL real con las migraciones
 * de db/ aplicadas. Se omite si no se define TEST_DB_NAME, p. ej.:
 *
 *   TEST_DB_NAME=elecciones_seccionales_test npm test
 */
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');

const TEST_DB_NAME = process.env.TEST_DB_NAME;

describe('Recintos electorales (integración con PostgreSQL)', { skip: !TEST_DB_NAME && 'TEST_DB_NAME no definido' }, () => {
    // dotenv no sobrescribe variables ya definidas: así db.config apunta a la base de prueba.
    process.env.DB_NAME = TEST_DB_NAME;
    const db = require('../../config/db.config');
    const { crearRecintoElectoralRepository } = require('../../repositories/recinto-electoral.repository');
    const { crearRecintoElectoralService } = require('../../services/recinto-electoral/recinto-electoral.service');
    const ValidacionError = require('../../services/errores/validacion.error');
    const Acta = require('../../models/acta');
    const usuario = require('../../models/usuario');

    const service = crearRecintoElectoralService({ recintoRepository: crearRecintoElectoralRepository(db) });

    after(() => db.$pool.end());

    it('lista los recintos de Imbabura cargados desde el distributivo del CNE', async () => {
        const recintos = await service.listarActivos();
        const imbabura = recintos.filter((r) => r.provincia.codigo === '10');
        assert.equal(imbabura.length, 125);
        assert.equal(imbabura.reduce((s, r) => s + r.numero_electores, 0), 381222);
        assert.ok(recintos.every((r) => r.nombre_recinto && r.nombre_parroquia && r.nombre_canton && r.nombre_provincia));
    });

    it('filtra por cantón y por parroquia usando los códigos oficiales', async () => {
        const ibarra = await service.buscarPorUbicacion({ provincia: '10', canton: '1001', parroquia: '' });
        assert.equal(ibarra.length, 53);
        const caranqui = await service.buscarPorUbicacion({ provincia: '10', canton: '1001', parroquia: '100101' });
        assert.equal(caranqui.length, 4);
        assert.ok(caranqui.every((r) => r.parroquia.nombre === 'CARANQUI'));
    });

    it('ya no depende de que los nombres coincidan con tildes (antes devolvía 0)', async () => {
        const fernandez = await service.buscarPorUbicacion({ provincia: '04', canton: '0405', parroquia: '040553' });
        assert.equal(fernandez.length, 2);
    });

    it('suma electores por cantón', async () => {
        assert.deepEqual(await service.contarElectoresPorCanton({ provincia: '10', canton: '1001' }), { numero_electores: 178634 });
        assert.deepEqual(await service.contarElectoresPorCanton({ provincia: '04', canton: '0405' }), { numero_electores: 55400 });
        assert.deepEqual(await service.contarElectoresPorCanton({ provincia: '10', canton: '1006' }), { numero_electores: 0 });
    });

    it('crea un recinto y la base hace cumplir las restricciones', async () => {
        await db.tx(async (t) => {
            const repo = crearRecintoElectoralRepository(t);
            const txService = crearRecintoElectoralService({ recintoRepository: repo });
            const id = await txService.crear({ nombre: 'RECINTO DE PRUEBA', parroquia_id: 607, juntas_femeninas: 1, juntas_masculinas: 2 });
            const fila = await repo.obtenerPorId(id);
            assert.equal(fila.total_juntas, 3);
            assert.equal(fila.parroquia_nombre, 'CARANQUI');
            await assert.rejects(() => repo.crear({ ...fila, codigo: null, parroquia_id: 999999 }), /fk_recinto_electoral_parroquia/);
            throw new Error('ROLLBACK');
        }).catch((e) => { if (e.message !== 'ROLLBACK') throw e; });
        await assert.rejects(() => service.crear({ nombre: 'sin parroquia' }), ValidacionError);
    });

    it('las consultas existentes de actas y usuarios siguen resolviendo el recinto', async () => {
        const actas = await Acta.getAll();
        assert.equal(actas.length, 17);
        assert.ok(actas.every((a) => a.recinto && a.recinto.nombre_recinto));
        const usuarios = await usuario.getAll();
        assert.ok(Array.isArray(usuarios));
    });
});
