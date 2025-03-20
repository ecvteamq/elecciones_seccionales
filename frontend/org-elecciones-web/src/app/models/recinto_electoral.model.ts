export class RecintoElectoral{
    id:string;
    nombre_recinto:string;
    direccion_recinto:string;
    estado:string;
    nombre_parroquia:string;
    nombre_canton:string;
    nombre_provincia:string;
    codigo_recinto:string;
    junta_femenino:string;
    junta_masculino:string;
    numero_junta:string;

    constructor(){
        this.nombre_recinto = "";
        this.direccion_recinto = "";
        this.estado = "ACTIVO";
    }

}