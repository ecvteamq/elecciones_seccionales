/**
 * Adaptador HTTP de los distritos (circunscripciones electorales).
 * El repositorio se inyecta para poder probarlo sin base de datos.
 *
 * @param {object} deps
 * @param {ReturnType<import('../repositories/distrito.repository').crearDistritoRepository>} deps.distritoRepository
 */
function crearDistritoController({ distritoRepository }) {
    return {
        /** GET /api/distrito?provincia=10&canton=1001&dignidad=3 */
        async getByCanton(req, res) {
            try {
                const { provincia, canton, dignidad } = req.query || {};
                if (!provincia || !canton) {
                    return res.status(400).json({ success: false, message: 'Debe indicar la provincia y el cantón' });
                }
                const distritos = await distritoRepository.listarPorCanton({
                    codigoProvincia: String(provincia),
                    codigoCanton: String(canton),
                    dignidadId: dignidad ? Number(dignidad) : null,
                });
                return res.status(200).json(distritos);
            } catch (error) {
                console.log(`Error: ${error}`);
                return res.status(500).json({ success: false, message: 'Error al obtener los distritos' });
            }
        },
    };
}

module.exports = { crearDistritoController };
