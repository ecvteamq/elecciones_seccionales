import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Provincia } from '../models/provincia.model';

@Injectable({
    providedIn: 'root'
})
export class ProvinciaService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/provincia/getAll';
        return this.http.get<Provincia[]>(url);
    }
}
