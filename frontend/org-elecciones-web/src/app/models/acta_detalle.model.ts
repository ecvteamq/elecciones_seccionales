import { Candidato } from "./candidato.model";

export class ActaDetalle {
    id: bigint;
    acta: bigint;
    lista: string;
    candidato: Candidato;
    voto: number;
    partido:string;
    dignidad:string;

    constructor(candidato: Candidato) {
        this.candidato = candidato;
    }

}