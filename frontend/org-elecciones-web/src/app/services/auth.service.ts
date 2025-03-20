import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalService } from './local.service';
import { environment } from 'src/environments/environment';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { Token } from '../models/token.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token!: Token;
  private usuario!: Usuario;
  private api_url: String;
  public sweetAlert: SweetalertConfig;
  isLoggedIn: boolean;


  constructor(
    private localService: LocalService,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    this.isLoggedIn = !!this.getToken();
    console.log("esta logueado:",this.isLoggedIn);
    this.sweetAlert = new SweetalertConfig();
    this.api_url = environment.API_URL;
  }

  get tokenIsExpired(): boolean {
    return this.token?.isExpired;
  }

  get tokenAutorization(): string {
    return this.token.authorization;
  }

  get usuarioSession():Usuario{
    if(!this.usuario){
      const user = this.localService.getJsonValue('usuario');
      console.log("usuario service:",user);
      
      if(user) this.usuario = new Usuario(user);
    }
    return this.usuario;
  }

  getToken(): Token {
    if(!this.token) {
      const token = this.localService.getJsonValue('accessToken');
      console.log("access token:",token);
      
      if(token) this.token = new Token(token);
    }
    return this.token;
  }

  private async oauthToken(body:any): Promise<Token> {
    let url = this.api_url + '/api/users/login';

    let headers = new HttpHeaders({ 'Content-type': 'application/json' });

    const response: any = await this.httpClient.post(url, body, {headers}).toPromise();
    console.log("respuesta backend token:",response);
    
    this.token = new Token(response.data);
    this.localService.setJsonValue('accessToken', this.token);

    this.usuario = new Usuario(response.data);
    
    this.localService.setJsonValue('usuario', this.usuario);

    this.isLoggedIn = true;
    return this.token;
  }

  async login(identificacion: string, contrasenia: string): Promise<void> {
    try {
      this.sweetAlert.showMessage('loading','Cargando....',null);      
      await this.oauthToken({identificacion, contrasenia});
      this.sweetAlert.showMessage('close',"Cerrando Sesión",null);
      this.router.navigate(['/']);
    } catch (error:any) {
      this.sweetAlert.showMessage('error', error.error.message || 'No hay conexión con el servidor',null);
      this.errorOauthToken(error);
    }
  }

  cerrarSesion(): void {
    this.isLoggedIn = false;
    this.token = null as any;
    this.localService.clear();
    this.router.navigate(['/auth/login']);
  }


  private errorOauthToken(error:any): void {
    this.isLoggedIn = false;
    this.token = null as any;
    this.localService.clear();
  }


}
