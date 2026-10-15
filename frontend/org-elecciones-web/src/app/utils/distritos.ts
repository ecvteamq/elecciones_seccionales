import { Distrito } from '../models/distrito.model';
import { Parroquia } from '../models/parroquia.model';

/**
 * Parroquias válidas para una dignidad según sus distritos en el cantón:
 * - sin distritos configurados: todas las parroquias del cantón;
 * - con un distrito seleccionado: solo las de ese distrito;
 * - sin distrito seleccionado: las que forman alguno de los distritos
 *   (p. ej. para concejales urbanos se excluyen las parroquias rurales).
 */
export function parroquiasDeDistritos(parroquias: Parroquia[], distritos: Distrito[], distritoId?: number | string): Parroquia[] {
    if (!distritos || distritos.length == 0) {
        return parroquias || [];
    }
    const seleccionado = distritos.find(d => d.id == distritoId);
    const codigos = new Set<string>();
    for (const distrito of seleccionado ? [seleccionado] : distritos) {
        (distrito.parroquias || []).forEach(p => codigos.add(p.codigo));
    }
    return (parroquias || []).filter(p => codigos.has(p.codigo));
}
