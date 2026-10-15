export interface UbicacionRecinto {
    id: number;
    codigo: string;
    nombre: string;
}

export class RecintoElectoral {
    id: number;
    codigo: string;
    nombre: string;
    direccion: string;
    estado: string;
    parroquia?: UbicacionRecinto;
    canton?: UbicacionRecinto;
    provincia?: UbicacionRecinto;
    juntas_femeninas?: number;
    juntas_masculinas?: number;
    total_juntas?: number;
    junta_inicial_femenina?: number;
    junta_final_femenina?: number;
    junta_inicial_masculina?: number;
    junta_final_masculina?: number;
    numero_electores?: number;
    electores_femeninos?: number;
    electores_masculinos?: number;

    // Campos de compatibilidad que entrega el backend para las pantallas existentes.
    nombre_recinto: string;
    direccion_recinto: string;
    nombre_parroquia: string;
    nombre_canton: string;
    nombre_provincia: string;
    junta_femenino: number;
    junta_masculino: number;

    constructor(){
        this.nombre_recinto = "";
        this.direccion_recinto = "";
        this.estado = "ACTIVO";
    }

}
