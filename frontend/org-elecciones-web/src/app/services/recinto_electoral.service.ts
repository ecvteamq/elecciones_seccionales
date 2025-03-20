import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RecintoElectoral } from '../models/recinto_electoral.model';

@Injectable({
    providedIn: 'root'
})
export class RecintoElectoralService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/recinto-electoral/getAll';
        return this.http.get<RecintoElectoral[]>(url);
    }

    getByFilter(recintoElectoral) {
        let url = this.api_url + '/api/recinto-electoral/getByFilter';
        let body = recintoElectoral;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });

        return this.http.post<RecintoElectoral[]>(url, body, { headers });
    }

    getNroElectoresByCanton(recintoElectoral) {
        let url = this.api_url + '/api/recinto-electoral/getNroElectoresByCanton';
        let body = recintoElectoral;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this.http.post<any>(url, body, { headers });
    }
}
