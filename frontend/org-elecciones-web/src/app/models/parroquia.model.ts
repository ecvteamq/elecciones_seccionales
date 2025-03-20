export class Parroquia {
    id: bigint;
    descripcion: string;
    canton: string;
    codigo:string;
    nombre:string;

    constructor() {
        this.descripcion = "";
        this.canton = "";
        this.codigo = "";
        this.nombre = "";
    }
}