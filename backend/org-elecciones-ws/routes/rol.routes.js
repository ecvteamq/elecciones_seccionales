const rolController = require('../controllers/rol.controller');
const validateToken = require('../middleware/jwt');

module.exports = (app)=>{
    app.get('/api/rol/getAll',rolController.getAll);
    app.post('/api/rol',validateToken, rolController.create);
    // app.delete('/api/rol/:rol_id',validateToken, rolController.delete);
    // app.put('/api/rol',validateToken, rolController.update);
}