import { Provincia } from "./provincia.model";

export class Candidato {
    id: bigint;
    provincia: string;
    canton: string;
    parroquia:string;
    dignidad:string;
    lista:string;
    partido:string;
    nombre:string;
    nombre_papeleta:string;
    orden:string;
    estado:string;
    /*este campo se lo guarda en la entidad acta detalle*/
    votos:number=0;

    constructor() {
        this.canton = "";
        this.provincia = "";
        this.parroquia = "";
        this.dignidad = "";
        this.nombre = "";
        this.nombre_papeleta = "";
        this.orden = "";
        this.estado = "";
        this.votos = 0;
    }
}