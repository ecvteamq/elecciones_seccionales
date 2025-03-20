const provinciaController = require('../controllers/provincia.controller');

module.exports = (app)=>{
    app.get('/api/provincia/getAll',provinciaController.getAll);
}