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
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

  myForm: FormGroup;
  public vl: Validaciones;
  public sweetAlert: SweetalertConfig;
  public showRegister: Boolean;
  public provincias: Provincia[];
  public cantones: Canton[];
  public parroquias: Parroquia[];
  public corregirContrasenia: string;

  constructor(
    private formBuilder: FormBuilder,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService,
    private usuarioService: UsuarioService,
    private router:Router
  ) {
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.showRegister = false;
    this.provincias = [];
    this.cantones = [];
    this.parroquias = [];
    this.corregirContrasenia = "";
  }

  ngOnInit(): void {
    this.buildForm();
    this.getProvincias();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      identificacion: ['', [Validators.required, Validators.pattern(/[0-9]{10}/), Validators.maxLength(10)]],
      provincia: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      parroquia: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      telefono: [''],
      direccion: [''],
      recinto_electoral: [''],
      numero_junta: [''],
      genero: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      confirmar_contrasenia: ['', [Validators.required]]
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

  getCantonesByProvincia() {
    console.log(this.myForm.controls['provincia'].value);

    this.cantonService.getByProvincia(this.myForm.get('provincia').value).subscribe((data: Canton[]) => {
      this.cantones = data;
    }, err => {
      this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
      console.log("error:" + err.error.message);
    });
  }

  getParroquiaByCanton() {
    console.log(this.myForm.get('canton').value);
    this.parroquiaService.getByCantonAndProvincia(this.myForm.get('canton').value, this.myForm.get('provincia').value).subscribe((data: Parroquia[]) => {
      this.parroquias = data;
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

  verificarContrasenia(campo) {
    return this.myForm.get(campo).dirty;
  }

  verificarContraseniasIguales() {
    if (this.myForm.get('contrasenia').value != this.myForm.get('confirmar_contrasenia').value) {
      return "Las contraseñas no coinciden";
    }
    return "";
  }

  async registrate(event: Event) {
    event.preventDefault();
    if (this.myForm.valid) {
      this.sweetAlert.showMessage('loading', 'Cargando....', null);
      this.usuarioService.save(this.myForm.value).subscribe({
        next: (result: any) => {
          this.sweetAlert.showMessage('close', null, null);
          this.sweetAlert.showMessage('success', "Registro exitoso,espere a que el administrador active su cuenta", null);
          this.router.navigate(['/auth/login']);
        },
        complete: () => {
          this.myForm.reset();
        },
        error: (err) => {
          this.sweetAlert.showMessage('error', err.error.message, null);
        }
      });
    } else {
      this.sweetAlert.showMessage('error', 'Debe ingresar la información requerida con los formatos especificados', null);
    }
  }

}
