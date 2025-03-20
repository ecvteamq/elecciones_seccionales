const Parroquia = require("../models/parroquia");
module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Parroquia.getAll();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las parroquias",
      });
    }
  },
  async getById(req, res, next) {
    try {
      const id = req.params.parroquia_id;
      const data = await Parroquia.getById();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las parroquias",
      });
    }
  },
  async getByNombre(req, res, next) {
    try {
      const body = req.body;
      const data = await Parroquia.findByNombre(body.nombre,body.provincia,body.canton);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las parroquias",
      });
    }
  },
  async getByCanton(req, res, next) {
    try {
      const canton = req.params.canton;
      const provincia = req.params.provincia;
      console.log("canton:" + canton);
      const data = await Parroquia.getByCanton(canton, provincia);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la parroquia por canton : " + error.message,
      });
    }
  }
};