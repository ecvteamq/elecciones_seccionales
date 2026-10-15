import { Parroquia } from "./parroquia.model";

/** Circunscripción electoral de un cantón (p. ej. concejales urbanos por distrito). */
export class Distrito {
    id: number;
    nombre: string;
    escanos?: number;
    estado?: string;
    codigo_canton?: string;
    dignidad_id?: number;
    parroquias: Parroquia[];

    constructor() {
        this.nombre = "";
        this.parroquias = [];
    }
}
