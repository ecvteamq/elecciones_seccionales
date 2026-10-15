import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api_url: String;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.api_url = environment.API_URL
  }

  login(usuario) {
    let url = this.api_url + '/api/users/login';
    let body = usuario;
    let headers = new HttpHeaders({ 'Content-type': 'application/json' });

    return this.http.post(url, body, { headers });

  }

  save(body) {
    let url = this.api_url + '/api/users/create';
    return this.http.post(url, body);
  }

  /** Creación desde la administración: el usuario queda activo con los roles indicados. */
  createByAdmin(body) {
    let url = this.api_url + '/api/users/createByAdmin';
    let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
    return this.http.post(url, body, { headers });
  }

  reactivate(id) {
    let url = this.api_url + '/api/users/reactivate';
    let body = {
      usuario_id: id
    };
    console.log(this.authService.getToken().token);
    
    let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
    return this.http.put(url, body, { headers });
  }

  activateAllUser() {
    let url = this.api_url + '/api/users/activateAll';
    let body = {
    };    
    return this.http.put(url, body);
  }

  getAll() {
    let url = this.api_url + '/api/users/getAll';
    return this.http.get(url);
  }

  getAllInactive() {
    let url = this.api_url + '/api/users/getAllInactive';
    return this.http.get(url);
  }

  getRepartidorRandom() {
    let url = this.api_url + '/api/users/getRepartidorRandom';
    return this.http.get(url);
  }

  delete(id) {
    let url = this.api_url + `/api/users/inactive`;
    let body = {
      usuario_id: id
    }
    let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
    return this.http.put(url, body, { headers });
  }

  update(body) {
    let url = this.api_url + '/api/users/updateUserRol';
    console.log("token:", this.authService.getToken().token);
    let headers = new HttpHeaders({ 'Authorization': this.authService.getToken().token });
    // headers.set('Authorization',this.authService.getToken().token);
    return this.http.put(url, body, { headers });
  }


}
