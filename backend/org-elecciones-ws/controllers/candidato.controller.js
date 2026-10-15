const Candidato = require("../models/candidato");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");
const Dignidad = require("../models/dignidad");
const db = require("../config/db.config");
const { crearDistritoRepository } = require("../repositories/distrito.repository");

const distritoRepository = crearDistritoRepository(db);

/**
 * La parroquia determina el distrito: si la parroquia pertenece a un distrito de la dignidad,
 * se asigna ese distrito y se rechaza uno distinto. Devuelve un mensaje de error o null.
 */
async function validarDistrito(candidato) {
  if (!candidato.parroquia || !candidato.dignidad) {
    return null;
  }
  const dignidad = await Dignidad.findByDescripcion(candidato.dignidad);
  if (!dignidad) {
    return null;
  }
  const distrito = await distritoRepository.buscarPorParroquia({
    codigoParroquia: candidato.parroquia,
    dignidadId: dignidad.id
  });
  if (!distrito) {
    // Si la dignidad tiene distritos en el cantón, la parroquia debe pertenecer a alguno
    const distritosCanton = await distritoRepository.listarPorCanton({
      codigoProvincia: candidato.provincia,
      codigoCanton: candidato.canton,
      dignidadId: dignidad.id
    });
    return distritosCanton.length > 0
      ? `La parroquia seleccionada no pertenece a ningún distrito de ${candidato.dignidad}`
      : null;
  }
  if (candidato.distrito && candidato.distrito != distrito.id) {
    return `La parroquia seleccionada pertenece al distrito ${distrito.nombre}`;
  }
  candidato.distrito = distrito.id;
  return null;
}

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await Candidato.getAll();
      // for(const i in data){
      //   data[i].parroquia = await Parroquia.findByNombre(data[i].parroquia,data[i].provincia_codigo, data[i].canton_codigo);
      // }
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los candidatos",
      });
    }
  },
  async getListas(req, res, next) {
    try {
      const data = await Candidato.getListas();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las listas",
      });
    }
  },
  async getByFilter(req, res, next) {
    try {
      const candidato = req.body;
      console.log("candidato:",candidato);
      const provincia = await Provincia.findByCodigo(candidato.provincia);
      const canton = await Canton.findByCodigo(candidato.canton, candidato.provincia);
      const parroquia = await Parroquia.findByCodigo(candidato.parroquia, candidato.provincia, candidato.canton);

      /** Concejales: los candidatos van por distrito, explícito o el que contiene a la parroquia */
      let distritoId = candidato.distrito || null;
      if (!distritoId && candidato.parroquia && candidato.dignidad.id) {
        const distrito = await distritoRepository.buscarPorParroquia({
          codigoParroquia: candidato.parroquia,
          dignidadId: candidato.dignidad.id
        });
        distritoId = distrito ? distrito.id : null;
      }

      const candidatoParam = {
        "provincia": JSON.parse(JSON.stringify(provincia)).nombre,
        "canton": JSON.parse(JSON.stringify(canton)).nombre,
        "parroquia": distritoId || candidato.parroquia == null || candidato.parroquia == '' ? null : JSON.parse(JSON.stringify(parroquia)).nombre,
        "dignidad": candidato.dignidad.descripcion,
        "distrito": distritoId
      }
      let data;
      if (candidato.dignidad.tipo == 'UNIPERSONAL') {
        data = await Candidato.getCandidatoByFilters(candidatoParam);
      } else {
        data = await Candidato.getCandidatosMultipersonal(candidatoParam);
      }
      return res.status(201).json(data);
    } catch (error) {
      next(error);
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el canton por provincia : " + error.message,
      });
    }
  },
  async create(req, res, next) {
    try {
      const candidato = req.body;
      const errorDistrito = await validarDistrito(candidato);
      if (errorDistrito) {
        return res.status(400).json({ success: false, message: errorDistrito });
      }

      if (candidato.parroquia != null) {
        const parroquiaResult = await Parroquia.findByCodigo(candidato.parroquia, candidato.provincia, candidato.canton);
        candidato.parroquia = JSON.parse(JSON.stringify(parroquiaResult)).nombre;
      }

      const cantonResult = await Canton.findByCodigo(candidato.canton, candidato.provincia);
      candidato.canton = JSON.parse(JSON.stringify(cantonResult)).nombre;

      const provinciaResult = await Provincia.findByCodigo(candidato.provincia);
      candidato.provincia = JSON.parse(JSON.stringify(provinciaResult)).nombre;
      candidato.estado = 'ACTIVO';
      console.log("candidato:", candidato);
      const data = await Candidato.create(candidato);

      return res.status(201).json({
        success: true,
        message:
          "El registro se realizo correctamente",
        data: data.id,
      });

    } catch (error) {
      next(error);
      /**Errores en conexion con la base de datos */
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro del usuario",
        error: error,
      });
    }
  },
  async update(req, res, next) {
    try {
      const candidato = req.body;
      const errorDistrito = await validarDistrito(candidato);
      if (errorDistrito) {
        return res.status(400).json({ success: false, message: errorDistrito });
      }
      if (candidato.parroquia != null) {
        const parroquiaResult = await Parroquia.findByCodigo(candidato.parroquia, candidato.provincia, candidato.canton);
        candidato.parroquia = JSON.parse(JSON.stringify(parroquiaResult)).nombre;
      }

      const cantonResult = await Canton.findByCodigo(candidato.canton, candidato.provincia);
      candidato.canton = JSON.parse(JSON.stringify(cantonResult)).nombre;

      const provinciaResult = await Provincia.findByCodigo(candidato.provincia);
      candidato.provincia = JSON.parse(JSON.stringify(provinciaResult)).nombre;

      console.log("data a actualizar:", candidato);
      await Candidato.update(candidato);
      return res.status(201).json({
        success: true,
        message: "La actualización se realizo correctamente",
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        success: false,
        message: "Error al actualizar el candidato",
      });
    }
  },
  async delete(req, res, next) {
    try {
      const candidato_id = JSON.parse(req.params.candidato_id);
      console.log("candidato_id:", candidato_id);
      const data = await Candidato.getById(candidato_id);
      console.log("data:", data);
      if (data != null) {
        await Candidato.delete(candidato_id);
        return res.status(201).json({
          success: true,
          message: "La eliminación se realizo correctamente",
        });
      } else {
        return res.status(501).json({
          success: false,
          message: "El candidato a eliminar no existe",
        });
      }
    } catch (error) {
      return res.status(501).json({
        success: false,
        message: "Error al eliminar el candidato",
      });
    }
  }
};