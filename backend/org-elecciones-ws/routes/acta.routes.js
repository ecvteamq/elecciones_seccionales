const actaController = require('../controllers/acta.controller');
const { crearRepartoController } = require('../controllers/reparto.controller');
const { obtenerMetodoReparto } = require('../services/reparto/metodo-reparto.factory');

const repartoController = crearRepartoController({
    Provincia: require('../models/provincia'),
    Canton: require('../models/canton'),
    Parroquia: require('../models/parroquia'),
    Candidato: require('../models/candidato'),
    obtenerMetodoReparto,
});

module.exports = (app)=>{
    app.get('/api/acta/getAll',actaController.getAll);
    app.get('/api/actaDetalle/getByActa/:actaId',actaController.getByActa);
    app.get('/api/acta/getPorcentajeEscrutinio/:dignidad',actaController.getPorcentajeEscrutinio);
    app.post('/api/acta/create',actaController.create);
    app.delete('/api/acta/delete',actaController.delete);
    app.post('/api/actaDetalle/getVotos',actaController.getVotos);
    app.post('/api/acta/createOnlyTotal',actaController.createOnlyTotal);
    app.post('/api/actaDetalle/metodoReparto',repartoController.calcularReparto);
    app.post('/api/actaDetalle/metodoWebster',repartoController.metodoWebster);
    app.post('/api/actaDetalle/metodoDHondt',repartoController.metodoDHondt);
    app.post('/api/acta/getActaTotalByFilters',actaController.getActaTotalByFilters);
    app.put('/api/acta/update',actaController.update);

}
