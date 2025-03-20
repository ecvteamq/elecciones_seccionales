const RecintoElectoral = require("../models/recinto_electoral");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await RecintoElectoral.getAll();
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
      const recinto_electoral = req.body;
      const data = await RecintoElectoral.create(recinto_electoral);

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
  async getNumeroElectoresByCanton(req, res, next) {
    try {
      const body = req.body;
      console.log("body:",body);
      const canton = await Canton.findByCodigo(body.canton, body.provincia);
      const data = await RecintoElectoral.getElectoresByCanton(JSON.parse(JSON.stringify(canton)).nombre);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener numero de electores por cantón",
      });
    }
  },
  async getByFilter(req, res, next) {
    try {
      const recinto = req.body;
      console.log("recinto body:", recinto);
      const provincia = await Provincia.findByCodigo(recinto.provincia);
      const canton = await Canton.findByCodigo(recinto.canton, recinto.provincia);
      const parroquia = await Parroquia.findByCodigo(recinto.parroquia, recinto.provincia, recinto.canton);

      const datos = {
        "provincia": provincia == null ? null : JSON.parse(JSON.stringify(provincia)).nombre,
        "canton": canton == null ? null : JSON.parse(JSON.stringify(canton)).nombre,
        "parroquia": parroquia == null ? null : JSON.parse(JSON.stringify(parroquia)).nombre
      }
      console.log("recinto datos:", datos);

      const data = await RecintoElectoral.getByFilters(datos);
      console.log(data.length);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener recinto electoral : " + error.message,
      });
    }
  }
};