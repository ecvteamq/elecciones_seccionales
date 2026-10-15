const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { crearRecintoElectoralService } = require('../../services/recinto-electoral/recinto-electoral.service');
const ValidacionError = require('../../services/errores/validacion.error');

const filaBase = {
    id: '1', codigo: null, nombre: 'R1', direccion: null, estado: 'ACTIVO',
    numero_electores: 100, total_juntas: 2,
    parroquia_id: '1', parroquia_codigo: '100101', parroquia_nombre: 'CARANQUI',
    canton_id: '1', canton_codigo: '1001', canton_nombre: 'IBARRA',
    provincia_id: '1', provincia_codigo: '10', provincia_nombre: 'IMBABURA',
};

describe('RecintoElectoralService', () => {
    let llamadas;
    let repo;
    let service;

    beforeEach(() => {
        llamadas = {};
        repo = {
            listar: async (filtro) => { llamadas.listar = filtro; return [filaBase]; },
            buscarPorUbicacion: async (filtro) => { llamadas.buscar = filtro; return [filaBase]; },
            sumarElectoresPorCanton: async (filtro) => { llamadas.sumar = filtro; return 4550; },
            crear: async (recinto) => { llamadas.crear = recinto; return 99; },
        };
        service = crearRecintoElectoralService({ recintoRepository: repo });
    });

    it('listarActivos pide solo recintos ACTIVOS y los mapea al contrato', async () => {
        const recintos = await service.listarActivos();
        assert.deepEqual(llamadas.listar, { estados: ['ACTIVO'] });
        assert.equal(recintos[0].nombre_recinto, 'R1');
        assert.equal(recintos[0].nombre_canton, 'IBARRA');
    });

    it('buscarPorUbicacion filtra por códigos y trata parroquia vacía como "todas"', async () => {
        await service.buscarPorUbicacion({ provincia: '10', canton: '1001', parroquia: '' });
        assert.deepEqual(llamadas.buscar, {
            codigoProvincia: '10', codigoCanton: '1001', codigoParroquia: null, estado: 'ACTIVO',
        });
    });

    it('buscarPorUbicacion filtra por parroquia cuando se envía', async () => {
        await service.buscarPorUbicacion({ provincia: '10', canton: '1001', parroquia: ' 100101 ' });
        assert.equal(llamadas.buscar.codigoParroquia, '100101');
    });

    it('buscarPorUbicacion exige provincia y cantón', async () => {
        await assert.rejects(() => service.buscarPorUbicacion({ provincia: '10' }), ValidacionError);
        await assert.rejects(() => service.buscarPorUbicacion(), ValidacionError);
        assert.equal(llamadas.buscar, undefined);
    });

    it('contarElectoresPorCanton devuelve un número', async () => {
        const r = await service.contarElectoresPorCanton({ provincia: '10', canton: '1001' });
        assert.deepEqual(r, { numero_electores: 4550 });
        assert.deepEqual(llamadas.sumar, { codigoProvincia: '10', codigoCanton: '1001', estado: 'ACTIVO' });
    });

    it('contarElectoresPorCanton devuelve 0 si el cantón no tiene recintos', async () => {
        repo.sumarElectoresPorCanton = async () => null;
        assert.deepEqual(await service.contarElectoresPorCanton({ provincia: '10', canton: '1006' }), { numero_electores: 0 });
    });

    it('crear valida antes de persistir y devuelve el id', async () => {
        const id = await service.crear({ nombre: 'Nuevo', parroquia_id: 607, juntas_femeninas: 1, juntas_masculinas: 1 });
        assert.equal(id, 99);
        assert.equal(llamadas.crear.total_juntas, 2);
        assert.equal(llamadas.crear.estado, 'ACTIVO');
    });

    it('crear no toca el repositorio si los datos son inválidos', async () => {
        await assert.rejects(() => service.crear({ nombre: '' }), ValidacionError);
        assert.equal(llamadas.crear, undefined);
    });
});
