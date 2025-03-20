const parroquiaController = require('../controllers/parroquia.controller');

module.exports = (app)=>{
    app.get('/api/parroquia/getAll',parroquiaController.getAll);
    app.get('/api/parroquia/getByCanton/:canton/provincia/:provincia',parroquiaController.getByCanton);
    app.get('/api/parroquia/getById/:parroquia_id',parroquiaController.getById);
    app.post('/api/parroquia/getByNombre',parroquiaController.getByNombre);
}