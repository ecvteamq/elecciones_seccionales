import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Canton } from '../models/canton.model';
import { Parroquia } from '../models/parroquia.model';

@Injectable({
    providedIn: 'root'
})
export class ParroquiaService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/parroquia/getAll';
        return this.http.get<Parroquia>(url);
    }

    getById(id) {
        let url = this.api_url + '/api/parroquia/getById/'+id;
        return this.http.get<Parroquia>(url);
    }

    getByCantonAndProvincia(canton:string,provincia:string){
        let url = this.api_url + '/api/parroquia/getByCanton/'+canton+'/provincia/'+provincia;
        return this.http.get<Parroquia[]>(url);
    }

    findByNombre(parroquia) {
        let url = this.api_url + '/api/parroquia/getByNombre';
        let body = parroquia;
        let headers = new HttpHeaders({ 'Content-type': 'application/json' });
        console.log("body:", parroquia);

        return this.http.post<Parroquia>(url, body, { headers });
    }
}
