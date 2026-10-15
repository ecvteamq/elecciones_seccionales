const Acta = require("../models/acta");
const ActaDetalle = require('../models/acta_detalle');
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");
const Candidato = require("../models/candidato");

module.exports = {
    async getAll(req, res, next) {
        try {
            const data = await Acta.getAll();
            return res.status(201).json(data);
        } catch (error) {
            next(error);
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    async getPorcentajeEscrutinio(req, res, next) {
        try {
            const dignidad = req.params.dignidad;
            const data = await Acta.getPorcentajeEscrutinio(dignidad);
            return res.status(201).json(data);
        } catch (error) {
            next(error);
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    async getByActa(req, res, next) {
        try {
            const actaId = req.params.actaId;
            const data = await ActaDetalle.getByActa(actaId);
            return res.status(201).json(data);
        } catch (error) {
            next(error);
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    async getActaTotalByFilters(req, res, next) {
        try {
            const acta = req.body;
            console.log("acta:", acta);
            const provincia = await Provincia.findByCodigo(acta.provincia);
            const canton = await Canton.findByCodigo(acta.canton, acta.provincia);
            let body = {
                "dignidad": acta.dignidad.id,
                "provincia": JSON.parse(JSON.stringify(provincia)).id,
                "canton": JSON.parse(JSON.stringify(canton)).id
            };
            const data = await Acta.getActaTotalByFilters(body);
            return res.status(201).json(data);
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    async getVotos(req, res, next) {
        try {
            const acta = req.body;
            // console.log("acta:",acta);
            // return;
            const parroquia = await Parroquia.findByCodigo(acta.parroquia, acta.provincia, acta.canton);
            console.log("parroquia:", parroquia);
            acta.parroquia = parroquia != null ? JSON.parse(JSON.stringify(parroquia)).id : null
            const provincia = await Provincia.findByCodigo(acta.provincia);
            acta.provincia = provincia != null ? JSON.parse(JSON.stringify(provincia)).id : null
            const canton = await Canton.findByCodigo(acta.canton, acta.provincia);
            acta.canton = canton != null ? JSON.parse(JSON.stringify(canton)).id : null

            // console.log("acta:",acta);
            // return;
            if (acta.dignidad.tipo == 'UNIPERSONAL') {
                console.log("entro unipersonal");
                let data;
                if ((acta.dignidad == null || acta.dignidad == '') && (acta.lista == null || acta.lista == '')) {
                    console.log("entro get all");
                    data = await ActaDetalle.getAll();
                } else {
                    console.log("entro by filter");
                    data = await ActaDetalle.getVotos(acta);
                }
                return res.status(201).json(data);
            } else {
                console.log("entro multipersonal");
                let data = await ActaDetalle.getVotosMultipersonal(acta);
                return res.status(201).json(data);
            }

        } catch (error) {
            next(error);
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    async create(req, res, next) {
        try {
            const acta = req.body;
            const provincia = await Provincia.findByCodigo(acta.provincia);
            const canton = await Canton.findByCodigo(acta.canton, acta.provincia);
            const parroquia = await Parroquia.findByCodigo(acta.parroquia, acta.provincia, acta.canton);

            const bodyActa = {
                "provincia": JSON.parse(JSON.stringify(provincia)).id,
                "canton": JSON.parse(JSON.stringify(canton)).id,
                "parroquia": parroquia != null ? JSON.parse(JSON.stringify(parroquia)).id : null,
                "dignidad": acta.dignidad.id,
                "genero": acta.genero,
                "numero_junta": acta.numero_junta,
                "recinto_electoral": acta.recinto_electoral ? acta.recinto_electoral.id : null,
                "total_votantes": acta.total_votantes,
                "votos_validos": acta.votos_validos,
                "votos_blancos": acta.votos_blancos,
                "votos_nulos": acta.votos_nulos,
                "inasistentes": acta.inasistentes,
                "tipo_acta": acta.tipo_acta
            };
            console.log("body acta:", bodyActa);
            const dataActa = await Acta.create(bodyActa);

            const nro_acta = "ACT-" + dataActa.id + "-2023";

            await Acta.update(nro_acta, dataActa.id);

            for (const i in acta.detalles) {

                if (acta.dignidad.tipo == 'UNIPERSONAL') {

                    const candidatoSearch = await Candidato.getCandidatoByNombreAndCanton(acta.detalles[i].nombre_papeleta, JSON.parse(JSON.stringify(canton)).nombre);
                    const bodyActaDetalle = {
                        "acta": dataActa.id,
                        "lista": acta.detalles[i].lista,
                        "candidato": JSON.parse(JSON.stringify(candidatoSearch)).id,
                        "voto": acta.detalles[i].votos,
                        "dignidad": acta.dignidad.descripcion
                    };
                    await ActaDetalle.create(bodyActaDetalle);

                } else {
                    const bodyActaDetalle = {
                        "acta": dataActa.id,
                        "lista": acta.detalles[i].lista,
                        "partido": acta.detalles[i].nombre_papeleta,
                        "voto": acta.detalles[i].votos,
                        "dignidad": acta.dignidad.descripcion
                    };
                    await ActaDetalle.create(bodyActaDetalle);
                }
            }
            console.log("nro acta:", nro_acta);
            const result = {
                numero_acta: nro_acta,
                id: dataActa.id
            }
            return res.status(201).json({
                success: true,
                message:
                    "Se ha registrado la información correctamente",
                data: result
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
            const body = req.body;
            const detalles = body.detalles;
            console.log("detalles:", detalles);
            let acta = {
                "acta": body.acta,
                "total_votante": body.total_votante,
                "voto_valido": body.voto_valido,
                "voto_blanco": body.voto_blanco,
                "voto_nulo": body.voto_nulo,
                "inasistente": body.inasistente,
            }
            const data = await Acta.updateTotales(acta);
            for (const i in detalles) {
                let actaDetalle = {
                    "id": detalles[i].id,
                    "voto": detalles[i].voto
                }
                await ActaDetalle.updateDetalle(actaDetalle);
            }
            return res.status(201).json(data);
        } catch (error) {
            next(error);
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al obtener las dignidades",
            });
        }
    },
    /**Método para solo registrar totales de otros cantones*/
    async createOnlyTotal(req, res, next) {
        try {
            const acta = req.body;
            const provincia = await Provincia.findByCodigo(acta.provincia);
            const canton = await Canton.findByCodigo(acta.canton, acta.provincia);

            const bodyActa = {
                "provincia": JSON.parse(JSON.stringify(provincia)).id,
                "canton": JSON.parse(JSON.stringify(canton)).id,
                "total_votantes": acta.total_votantes,
                "votos_validos": acta.votos_validos,
                "votos_blancos": acta.votos_blancos,
                "votos_nulos": acta.votos_nulos,
                "inasistentes": acta.inasistentes,
                "dignidad": acta.dignidad.id,
                "tipo_acta": 'SOLO_TOTALES'
            };
            const dataActa = await Acta.create(bodyActa);
            const nro_acta = "ACT-" + dataActa.id + "-2023";
            await Acta.update(nro_acta, dataActa.id);
            const result = {
                numero_acta: nro_acta,
                id: dataActa.id
            }
            return res.status(201).json({
                success: true,
                message:
                    "Se ha registrado la información correctamente",
                data: result
            });
        } catch (error) {
            next(error);
            /**Errores en conexion con la base de datos */
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Hubo un error con la creación de totales por cantones",
                error: error,
            });
        }
    },
    async delete(req, res, next) {
        try {
            const data = await Acta.delete();
            await ActaDetalle.delete();
            return res.status(201).json(data);
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: "Error al eliminar los votos",
            });
        }
    },
};