const { calcularVotosCandidatos } = require('../services/reparto/reparto.service');

/**
 * Crea el controlador de reparto de votos entre candidatos de un partido.
 * Las dependencias se inyectan para desacoplarlo del acceso a datos.
 *
 * @param {object} deps
 * @param {{findByCodigo: Function}} deps.Provincia
 * @param {{findByCodigo: Function}} deps.Canton
 * @param {{findByCodigo: Function}} deps.Parroquia
 * @param {{getCandidatosPartido: Function}} deps.Candidato
 * @param {(codigo?: string) => import('../services/reparto/metodo-reparto')} deps.obtenerMetodoReparto
 */
function crearRepartoController({ Provincia, Canton, Parroquia, Candidato, obtenerMetodoReparto }) {

    async function responderReparto(metodo, req, res) {
        try {
            const acta = req.body || {};
            if (!acta.partido || !acta.dignidad) {
                return res.status(400).json({ success: false, message: 'Debe indicar la dignidad y el partido' });
            }

            const provincia = await Provincia.findByCodigo(acta.provincia);
            const canton = await Canton.findByCodigo(acta.canton, acta.provincia);
            if (!provincia || !canton) {
                return res.status(400).json({ success: false, message: 'Provincia o cantón no encontrados' });
            }
            // Con distrito (concejales) los candidatos se filtran por distrito y no por parroquia
            const distrito = acta.distrito || null;
            const parroquia = acta.parroquia && !distrito
                ? await Parroquia.findByCodigo(acta.parroquia, acta.provincia, acta.canton)
                : null;

            const candidatos = await Candidato.getCandidatosPartido({
                dignidad: acta.dignidad,
                provincia: provincia.nombre,
                canton: canton.nombre,
                parroquia: parroquia ? parroquia.nombre : null,
                partido: acta.partido,
                distrito,
            });

            return res.status(201).json(calcularVotosCandidatos(metodo, acta.votosPartido, candidatos));
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: `Error al generar el método ${metodo.nombre}`,
            });
        }
    }

    return {
        /** Usa el método configurado como activo (D'Hondt por defecto). */
        calcularReparto(req, res) {
            return responderReparto(obtenerMetodoReparto(), req, res);
        },
        /** Se conserva por compatibilidad: siempre usa Webster. */
        metodoWebster(req, res) {
            return responderReparto(obtenerMetodoReparto('WEBSTER'), req, res);
        },
        /** Se expone explícitamente D'Hondt. */
        metodoDHondt(req, res) {
            return responderReparto(obtenerMetodoReparto('DHONDT'), req, res);
        },
    };
}

module.exports = { crearRepartoController };
