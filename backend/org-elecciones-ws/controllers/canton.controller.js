const Canton = require("../models/canton");
module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Canton.getAll();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los cantones",
      });
    }
  },
  async getByProvincia(req, res, next) {
    try {
      const provincia = req.params.provincia;
      const data = await Canton.getByProvincia(provincia);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el canton por provincia : " + error.message,
      });
    }
  }
};