const recintoController = require('../controllers/recinto_electoral.controller');
const validateToken = require('../middleware/jwt');

module.exports = (app) => {
    app.get('/api/recinto-electoral/getAll', recintoController.getAll);
    app.post('/api/recinto-electoral', recintoController.create);
    app.post('/api/recinto-electoral/getByFilter', recintoController.getByFilter);
    app.post('/api/recinto-electoral/getNroElectoresByCanton', recintoController.getNumeroElectoresByCanton);
}