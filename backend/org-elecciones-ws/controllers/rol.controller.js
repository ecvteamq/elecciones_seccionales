const Rol = require("../models/rol");
module.exports = {
    async getAll(req, res, next) {
      try {
        const data = await Rol.getAll();
        return res.status(201).json(data);
      } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(501).json({
          success: false,
          message: "Error al obtener los roles",
        });
      }
    },
    async create(req, res, next) {
        try {
          const rol = req.body;
          const data = await Rol.create(rol);
    
          return res.status(201).json({
            success: true,
            message: "El registro se realizo correctamente",
            data: data.id,
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            success: false,
            message: "Error al crear el rol",
          });
        }
      },
};