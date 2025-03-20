import { Canton } from "./canton.model";
import { Parroquia } from "./parroquia.model";
import { Provincia } from "./provincia.model";

export class Usuario {

    id!: bigint;
    correo!: string;
    nombre!: string;
    apellido!: string;
    telefono!: string;
    roles!: any[];
    identificacion!: string;
    provincia: Provincia;
    canton: Canton;
    parroquia: Parroquia;
    genero:string;
    numero_junta:string;

    constructor(data: Usuario) {
        if (data) {
            this.id = data.id;
            this.correo = data.correo;
            this.apellido = data.apellido;
            this.nombre = data.nombre;
            this.telefono = data.telefono;
            this.roles = data.roles;
            this.identificacion = data.identificacion;
            this.provincia = data.provincia;
            this.canton = data.canton;
            this.parroquia = data.parroquia;
            this.numero_junta = data.numero_junta;
            this.genero = data.genero;
        }
    }

    get nombreCompleto(): string {
        return this.nombre + " " + this.apellido;
    }
}
