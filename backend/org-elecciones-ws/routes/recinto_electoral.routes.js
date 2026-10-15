const db = require('../config/db.config');
const { crearRecintoElectoralRepository } = require('../repositories/recinto-electoral.repository');
const { crearRecintoElectoralService } = require('../services/recinto-electoral/recinto-electoral.service');
const { crearRecintoElectoralController } = require('../controllers/recinto_electoral.controller');

const recintoController = crearRecintoElectoralController({
    recintoService: crearRecintoElectoralService({
        recintoRepository: crearRecintoElectoralRepository(db),
    }),
});

module.exports = (app) => {
    app.get('/api/recinto-electoral/getAll', recintoController.getAll);
    app.post('/api/recinto-electoral', recintoController.create);
    app.post('/api/recinto-electoral/getByFilter', recintoController.getByFilter);
    app.post('/api/recinto-electoral/getNroElectoresByCanton', recintoController.getNumeroElectoresByCanton);
}
