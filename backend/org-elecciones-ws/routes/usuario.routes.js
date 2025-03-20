const userController= require("../controllers/usuario.controller");
const validateToken = require('../middleware/jwt');

module.exports=(app)=>{
    app.get("/api/users/getAll",userController.getAll);
    app.get("/api/users/getAllInactive",userController.getAllInactive);
    app.get("/api/users/getRepartidorRandom",userController.getRepartidorRandom);
    app.get("/api/users/findByEmail/:email",userController.findByEmail);
    app.get("/api/users/confirm-email/:token",userController.confirmarEmail);
    app.get('/api/users/findById/:id',  userController.findById);
    app.get('/api/users/findDeliveryMen', userController.findDeliveryMen);
    app.post("/api/users/create",userController.create);
    app.post("/api/users/login",userController.login);
    app.post('/api/users/logout',userController.logout);
    app.post('/api/users/change-password',userController.changePassword)
    app.put('/api/users/updateUserRol', userController.update);
    app.put('/api/users/inactive', userController.delete);
    app.put('/api/users/reactivate', userController.reactivate);
    app.put('/api/users/activateAll', userController.activateAll);
}