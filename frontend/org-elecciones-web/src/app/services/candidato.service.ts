import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Candidato } from '../models/candidato.model';
import { Dignidad } from '../models/dignidad.model';

@Injectable({
    providedIn: 'root'
})
export class CandidatoService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    save(body) {
        let url = this.api_url + '/api/candidato/create';
        return this.http.post(url, body);
    }

    getAll() {
        let url = this.api_url + '/api/candidato/getAll';
        return this.http.get<Candidato[]>(url);
    }

    getListas() {
        let url = this.api_url + '/api/candidato/getListas';
        return this.http.get<Candidato[]>(url);
    }

    getByFilter(candidato) {
        let url = this.api_url + '/api/candidato/getByFilter';
        let body = candidato;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });
        console.log("body:", candidato);

        return this.http.post<Candidato[]>(url, body, { headers });
    }

    update(body) {
        let url = this.api_url + '/api/candidato';
        return this.http.put(url, body);
    }

    delete(id) {
        let url = this.api_url + `/api/candidato/${id}`;
        return this.http.delete(url);
    }
}
