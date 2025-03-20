import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Canton } from 'src/app/models/canton.model';
import { Parroquia } from 'src/app/models/parroquia.model';
import { Provincia } from 'src/app/models/provincia.model';
import { AuthService } from 'src/app/services/auth.service';
import { CantonService } from 'src/app/services/canton.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  myForm: FormGroup;
  public vl: Validaciones;
  public sweetAlert: SweetalertConfig;
  public showRegister: Boolean;
  public provincias: Provincia[];
  public cantones: Canton[];
  public parroquias: Parroquia[];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService
  ) {
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.showRegister = false;
    this.provincias = [];
    this.cantones = [];
    this.parroquias = [];
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      identificacion: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      cedula_registro: ['', Validators.required]
    });
  }

  getProvincias() {
    this.provinciaService.getAll().subscribe((data: Provincia[]) => {
      this.provincias = data;
    }, err => {
      this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
      console.log("error:" + err.error.message);
    });
  }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }

  public btnRegistrate() {
    this.showRegister = true;
    this.getProvincias();
  }

  public btnIniciaSesion() {
    this.showRegister = false;
    console.log("show register:", false);

  }

  async login(event: Event) {
    event.preventDefault();
    if (this.myForm.get('identificacion').value != '' && this.myForm.get('contrasenia').value != '') {
      const value = this.myForm.value;
      await this.authService.login(value.identificacion, value.contrasenia);
    } else {
      this.sweetAlert.showMessage('error', 'Debe ingresar el usuario y contraseña', null);
    }
  }

  async registrate(event: Event) {
    event.preventDefault();
    console.log("form", this.myForm.value);
    if (this.myForm.get('cedula_registro').value != '') {
      console.log("registro exitoso");
    } else {
      this.sweetAlert.showMessage('error', 'Debe ingresar la información requerida para el registro', null);
    }
  }

}
