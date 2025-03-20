const Dignidad = require("../models/dignidad");
const Candidato = require("../models/candidato");
module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Dignidad.getAll();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las dignidades",
      });
    }
  },
  async getById(req, res, next) {
    try {
      const id = req.params.dignidadId;
      const data = await Dignidad.getById(id);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las dignidades",
      });
    }
  },
  async getByDescripcion(req, res, next) {
    try {
      const body = req.params.descripcion;
      const data = await Dignidad.findByDescripcion(body);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las dignidades",
      });
    }
  },
  async delete(req, res, next) {
    try {
      const dignidad_id = JSON.parse(req.params.dignidad_id);
      console.log("dignidad:", dignidad_id);
      const data = await Dignidad.getById(dignidad_id);
      console.log("data:", data);
      if (data != null) {
        const comprobarDignidad = await Candidato.getByDignidad(data.descripcion);
        console.log("comprobar dignidad:", comprobarDignidad.length);
        if (comprobarDignidad.length > 0) {
          return res.status(501).json({
            success: false,
            message: "No se puede eliminar la dignidad porque esta siendo usada por un candidato",
          });
        } else{
          await Dignidad.delete(dignidad_id);
          return res.status(201).json({
            success: true,
            message: "La eliminación se realizo correctamente",
          });
        }
      } else {
        return res.status(501).json({
          success: false,
          message: "La dignidad a eliminar no existe",
        });
      }
    } catch (error) {
      return res.status(501).json({
        success: false,
        message: "Error al eliminar la dignidad",
      });
    }
  },
};