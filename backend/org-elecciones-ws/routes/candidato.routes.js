const candidatoController = require('../controllers/candidato.controller');

module.exports = (app)=>{
    app.get('/api/candidato/getAll',candidatoController.getAll);
    app.get('/api/candidato/getListas',candidatoController.getListas);
    app.post('/api/candidato/getByFilter',candidatoController.getByFilter)
    app.post('/api/candidato/create',candidatoController.create);
    app.put('/api/candidato', candidatoController.update);
    app.delete('/api/candidato/:candidato_id', candidatoController.delete);
}