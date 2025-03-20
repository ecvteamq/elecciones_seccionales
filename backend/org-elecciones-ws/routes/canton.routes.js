const cantonController = require('../controllers/canton.controller');

module.exports = (app)=>{
    app.get('/api/canton/getAll',cantonController.getAll);
    app.get('/api/canton/getByProvincia/:provincia',cantonController.getByProvincia)
}