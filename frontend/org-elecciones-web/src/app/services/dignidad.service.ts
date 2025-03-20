import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Dignidad } from '../models/dignidad.model';

@Injectable({
    providedIn: 'root'
})
export class DignidadService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/dignidad/getAll';
        return this.http.get<Dignidad[]>(url);
    }

    delete(id) {
        let url = this.api_url + `/api/dignidad/inactive/` + id;
        return this.http.delete(url);
    }

    getByDescripcion(value) {
        let url = this.api_url + '/api/dignidad/getByDescripcion/' + value;
        return this.http.get<Dignidad>(url);
    }
}
