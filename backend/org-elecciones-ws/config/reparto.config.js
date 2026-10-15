/**
 * Método de reparto usado para CONCEJALES URBANOS, CONCEJALES RURALES,
 * VOCALES DE JUNTAS PARROQUIALES e INTEGRANTES DEL CPCCS.
 * Valores posibles: 'DHONDT' | 'WEBSTER'. Se puede sobrescribir con la
 * variable de entorno METODO_REPARTO.
 */
module.exports = {
    METODO_REPARTO_ACTIVO: process.env.METODO_REPARTO || 'DHONDT',
};
