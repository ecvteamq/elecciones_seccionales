const actaController = require('../controllers/acta.controller');

module.exports = (app)=>{
    app.get('/api/acta/getAll',actaController.getAll);
    app.get('/api/actaDetalle/getByActa/:actaId',actaController.getByActa);
    app.get('/api/acta/getPorcentajeEscrutinio/:dignidad',actaController.getPorcentajeEscrutinio);
    app.post('/api/acta/create',actaController.create);
    app.delete('/api/acta/delete',actaController.delete);
    app.post('/api/actaDetalle/getVotos',actaController.getVotos);
    app.post('/api/acta/createOnlyTotal',actaController.createOnlyTotal);
    app.post('/api/actaDetalle/metodoWebster',actaController.metodoWebster);
    app.post('/api/acta/getActaTotalByFilters',actaController.getActaTotalByFilters);
    app.put('/api/acta/update',actaController.update);

}