import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Acta } from '../models/acta.model';
import { ActaDetalle } from '../models/acta_detalle.model';
import { Candidato } from '../models/candidato.model';
import { Dignidad } from '../models/dignidad.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ActaService {
    private api_url: String;
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/acta/getAll';
        return this.http.get<Acta[]>(url);
    }

    getActaDetalleById(id) {
        let url = this.api_url + '/api/actaDetalle/getByActa/'+id;
        return this.http.get<ActaDetalle[]>(url);
    }

    getPorcentajeEscrutinio(dignidad) {
        let url = this.api_url + '/api/acta/getPorcentajeEscrutinio/'+dignidad;
        return this.http.get(url);
    }

    save(body) {
        let url = this.api_url + '/api/acta/create';
        return this.http.post(url, body);
    }

    update(body) {
        let url = this.api_url + '/api/acta/update';
        return this.http.put(url, body);
    }

    saveOnlyTotal(body) {
        let url = this.api_url + '/api/acta/createOnlyTotal';
        return this.http.post(url, body);
    }

    delete() {
        let url = this.api_url + '/api/acta/delete';
        let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });

        return this.http.delete(url, { headers });
    }

    getVotos(parameters) {
        let url = this.api_url + '/api/actaDetalle/getVotos';
        let body = parameters;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });
        console.log("body:", body);

        return this.http.post<ActaDetalle[]>(url, body, { headers });
    }

    getActaTotalByFilters(parameters) {
        let url = this.api_url + '/api/acta/getActaTotalByFilters';
        let body = parameters;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });
        console.log("body:", body);

        return this.http.post<Acta[]>(url, body, { headers });
    }

    metodoWebster(body) {
        let url = this.api_url + '/api/actaDetalle/metodoWebster';
        return this.http.post(url, body);
    }



}
