import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Canton } from '../models/canton.model';

@Injectable({
    providedIn: 'root'
})
export class CantonService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    getAll() {
        let url = this.api_url + '/api/canton/getAll';
        return this.http.get<Canton>(url);
    }

    getByProvincia(provincia:string){
        let url = this.api_url + '/api/canton/getByProvincia/'+provincia;
        return this.http.get<Canton[]>(url);
    }
}
