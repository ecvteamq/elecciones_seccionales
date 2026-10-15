const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { crearRecintoElectoralRepository } = require('../../repositories/recinto-electoral.repository');

/** Doble de pg-promise que registra la consulta y los parámetros recibidos. */
function crearDbFalsa(respuesta) {
    const db = { consultas: [] };
    for (const metodo of ['one', 'oneOrNone', 'manyOrNone']) {
        db[metodo] = async (sql, params) => {
            db.consultas.push({ metodo, sql: sql.replace(/\s+/g, ' '), params });
            return respuesta;
        };
    }
    return db;
}

describe('RecintoElectoralRepository', () => {
    let db;
    let repo;

    beforeEach(() => {
        db = crearDbFalsa([]);
        repo = crearRecintoElectoralRepository(db);
    });

    it('lee del modelo normalizado (public.recinto_electoral + parroquia/cantón/provincia)', async () => {
        await repo.listar({ estados: ['ACTIVO'] });
        const { sql, params } = db.consultas[0];
        assert.match(sql, /FROM public\.recinto_electoral r/);
        assert.match(sql, /JOIN public\.parroquia parr ON parr\.id = r\.parroquia_id/);
        assert.match(sql, /JOIN public\.canton cant ON cant\.codigo = parr\.codigo_canton/);
        assert.match(sql, /JOIN public\.provincia prov ON prov\.codigo = cant\.codigo_provincia/);
        assert.doesNotMatch(sql, /aplicacion\./);
        assert.match(sql, /r\.estado IN \(\$1:csv\)/);
        assert.deepEqual(params, [['ACTIVO']]);
    });

    it('buscarPorUbicacion envía los códigos en orden y parroquia opcional', async () => {
        await repo.buscarPorUbicacion({ codigoProvincia: '10', codigoCanton: '1001', codigoParroquia: null, estado: 'ACTIVO' });
        const { sql, params } = db.consultas[0];
        assert.match(sql, /prov\.codigo = \$1 AND cant\.codigo = \$2/);
        assert.match(sql, /\(\$3::varchar IS NULL OR parr\.codigo = \$3\)/);
        assert.deepEqual(params, ['10', '1001', null, 'ACTIVO']);
    });

    it('sumarElectoresPorCanton devuelve el total', async () => {
        db = crearDbFalsa({ total: 4550 });
        repo = crearRecintoElectoralRepository(db);
        const total = await repo.sumarElectoresPorCanton({ codigoProvincia: '10', codigoCanton: '1001', estado: 'ACTIVO' });
        assert.equal(total, 4550);
        assert.deepEqual(db.consultas[0].params, ['10', '1001', 'ACTIVO']);
        assert.match(db.consultas[0].sql, /COALESCE\(SUM\(r\.numero_electores\), 0\)/);
    });

    it('obtenerPorId filtra por id', async () => {
        await repo.obtenerPorId(5);
        assert.match(db.consultas[0].sql, /WHERE r\.id = \$1/);
        assert.deepEqual(db.consultas[0].params, [5]);
    });

    it('crear inserta con parámetros nombrados y devuelve el id numérico', async () => {
        db = crearDbFalsa({ id: '144' });
        repo = crearRecintoElectoralRepository(db);
        const recinto = { nombre: 'X', parroquia_id: 607 };
        assert.equal(await repo.crear(recinto), 144);
        assert.match(db.consultas[0].sql, /INSERT INTO public\.recinto_electoral/);
        assert.match(db.consultas[0].sql, /\$<parroquia_id>/);
        assert.equal(db.consultas[0].params, recinto);
    });
});
