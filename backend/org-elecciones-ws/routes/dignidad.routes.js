const dignidadController = require('../controllers/dignidad.controller');

module.exports = (app)=>{
    app.get('/api/dignidad/getAll',dignidadController.getAll);
    app.get('/api/dignidad/getById/:dignidadId',dignidadController.getById);
    app.get('/api/dignidad/getByDescripcion/:descripcion',dignidadController.getByDescripcion);
    app.delete('/api/dignidad/inactive/:dignidad_id',dignidadController.delete);
}