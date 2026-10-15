const ValidacionError = require('../services/errores/validacion.error');

/**
 * Adaptador HTTP de los casos de uso de recintos electorales.
 * El servicio se inyecta para poder probarlo sin base de datos.
 *
 * @param {object} deps
 * @param {ReturnType<import('../services/recinto-electoral/recinto-electoral.service').crearRecintoElectoralService>} deps.recintoService
 */
function crearRecintoElectoralController({ recintoService }) {

    function responderError(res, error, mensaje) {
        if (error instanceof ValidacionError) {
            return res.status(400).json({ success: false, message: error.message, errors: error.detalles });
        }
        console.log(`Error: ${error}`);
        return res.status(500).json({ success: false, message: mensaje });
    }

    return {
        async getAll(req, res) {
            try {
                return res.status(200).json(await recintoService.listarActivos());
            } catch (error) {
                return responderError(res, error, 'Error al obtener los recintos electorales');
            }
        },

        async getByFilter(req, res) {
            try {
                return res.status(200).json(await recintoService.buscarPorUbicacion(req.body || {}));
            } catch (error) {
                return responderError(res, error, 'Error al obtener recinto electoral');
            }
        },

        async getNumeroElectoresByCanton(req, res) {
            try {
                return res.status(200).json(await recintoService.contarElectoresPorCanton(req.body || {}));
            } catch (error) {
                return responderError(res, error, 'Error al obtener numero de electores por cantón');
            }
        },

        async create(req, res) {
            try {
                const id = await recintoService.crear(req.body || {});
                return res.status(201).json({
                    success: true,
                    message: 'El registro se realizo correctamente',
                    data: id,
                });
            } catch (error) {
                return responderError(res, error, 'Error al crear el recinto electoral');
            }
        },
    };
}

module.exports = { crearRecintoElectoralController };
