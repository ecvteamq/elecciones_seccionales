import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RolService {
    private api_url: String;

    constructor(
        private http: HttpClient,
        private authService:AuthService
    ) {
        this.api_url = environment.API_URL
    }

    save(body) {
        let url = this.api_url + '/api/rol';
        let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
        return this.http.post(url, body,{headers});
    }

    update(body) {
        let url = this.api_url + '/api/rol';
        let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
        return this.http.put(url, body,{headers});
    }

    getAll() {
        let url = this.api_url + '/api/rol/getAll';
        return this.http.get(url);
    }

    delete(id) {
        let url = this.api_url + `/api/rol/${id}`;
        console.log("token:",this.authService.getToken().token);
        let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
        return this.http.delete(url,{headers});
    }
}
