import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Distrito } from '../models/distrito.model';

@Injectable({
    providedIn: 'root'
})
export class DistritoService {
    private api_url: String;
    constructor(
        private http: HttpClient
    ) {
        this.api_url = environment.API_URL
    }

    /** Distritos de un cantón; si se envía la dignidad (id), solo los de esa dignidad. */
    getByCanton(provincia: string, canton: string, dignidad?: string | number) {
        let params = new HttpParams().set('provincia', provincia).set('canton', canton);
        if (dignidad) {
            params = params.set('dignidad', String(dignidad));
        }
        return this.http.get<Distrito[]>(this.api_url + '/api/distrito', { params });
    }
}
