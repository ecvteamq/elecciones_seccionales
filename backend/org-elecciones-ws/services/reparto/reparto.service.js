/**
 * Ordena a los candidatos de un partido según su posición en la lista
 * (campo `orden`). Los que no tienen orden válido van al final.
 */
function ordenarPorPosicion(candidatos) {
    const posicion = (c) => {
        const orden = Number(c.orden);
        return c.orden !== null && c.orden !== '' && Number.isFinite(orden) ? orden : Infinity;
    };
    return [...candidatos].sort((a, b) => posicion(a) - posicion(b));
}

/**
 * Asigna a cada candidato del partido el cociente que le corresponde
 * según su posición en la lista y el método de reparto recibido.
 *
 * @param {import('./metodo-reparto')} metodo
 * @param {number|string} votosPartido
 * @param {object[]} candidatos
 * @returns {object[]} candidatos con la propiedad `voto` (string con 2 decimales)
 */
function calcularVotosCandidatos(metodo, votosPartido, candidatos) {
    const ordenados = ordenarPorPosicion(candidatos || []);
    const cocientes = metodo.calcularCocientes(Number(votosPartido), ordenados.length);
    return ordenados.map((candidato, i) => ({ ...candidato, voto: cocientes[i].toFixed(2) }));
}

module.exports = { calcularVotosCandidatos, ordenarPorPosicion };
