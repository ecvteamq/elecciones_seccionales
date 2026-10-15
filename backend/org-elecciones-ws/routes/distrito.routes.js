const db = require('../config/db.config');
const { crearDistritoRepository } = require('../repositories/distrito.repository');
const { crearDistritoController } = require('../controllers/distrito.controller');

const distritoController = crearDistritoController({
    distritoRepository: crearDistritoRepository(db),
});

module.exports = (app) => {
    app.get('/api/distrito', distritoController.getByCanton);
}
