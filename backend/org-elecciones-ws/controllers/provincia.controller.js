const Provincia = require("../models/provincia");
module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Provincia.getAll();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las provincias:" + error.message
      });
    }
  }
};