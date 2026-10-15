import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Canton } from 'src/app/models/canton.model';
import { Parroquia } from 'src/app/models/parroquia.model';
import { Provincia } from 'src/app/models/provincia.model';
import { RecintoElectoral } from 'src/app/models/recinto_electoral.model';
import { Rol } from 'src/app/models/rol.model';
import { Usuario } from 'src/app/models/usuario.model';
import { CantonService } from 'src/app/services/canton.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { RecintoElectoralService } from 'src/app/services/recinto_electoral.service';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';
import { Valores } from 'src/app/utils/valores';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  public displayModal: Boolean;
  public myForm: FormGroup;
  public sweetAlert: SweetalertConfig;
  public vl: Validaciones;
  public usuarios: Usuario[];
  public usuariosInactivos: Usuario[];
  public roles: Rol[];
  public usuarioRoles: Rol[];
  public provincias: Provincia[];
  public cantones: Canton[];
  public parroquias: Parroquia[];
  public recintos: RecintoElectoral[];
  loadingTable: boolean;
  editMod: Boolean;
  indexUsuarioSelected: number;
  keyConfirmPopup: string;
  public primaryColor: string;
  matchModeOptions: SelectItem[];

  constructor(
    public formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService,
    private recintoService: RecintoElectoralService
  ) {
    this.displayModal = false;
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.primaryColor = Valores.primaryColor;
    this.usuarioRoles = [];
    this.provincias = [];
    this.cantones = [];
    this.parroquias = [];
    this.recintos = [];
    this.matchModeOptions = [
      { label: 'Contiene', value: 'contains' },
    ];
  }

  ngOnInit(): void {
    this.onForm();
    this.onCallUsuarios();
    this.onCallUsuariosInactivos();
    this.onCallRoles();
    this.getProvincias();
  }

  /** Mismo formulario para crear y editar: la identificación y la contraseña solo se ingresan al crear. */
  onForm() {
    this.myForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      telefono: [''],
      genero: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      parroquia: ['', [Validators.required]],
      recinto_electoral: [null],
      numero_junta: [''],
      contrasenia: [''],
      rol: [''],
    });
  }

  private configurarModo(editar: boolean) {
    const identificacion = this.myForm.get('identificacion');
    const contrasenia = this.myForm.get('contrasenia');
    editar ? identificacion.disable() : identificacion.enable();
    contrasenia.setValidators(editar ? [] : [Validators.required, Validators.minLength(6)]);
    contrasenia.updateValueAndValidity();
  }

  onCallUsuarios() {
    this.loadingTable = true;
    this.usuarioService.getAll().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
      },
      complete: () => {
        this.loadingTable = false;
      },
      error: (err) => {
        this.loadingTable = false;
      }
    });
  }

  onCallUsuariosInactivos() {
    this.loadingTable = true;
    this.usuarioService.getAllInactive().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuariosInactivos = usuarios;
      },
      complete: () => {
        this.loadingTable = false;
      },
      error: (err) => {
        this.loadingTable = false;
      }
    });
  }

  onCallRoles() {
    this.loadingTable = true;
    this.rolService.getAll().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
      },
      complete: () => {
        this.loadingTable = false;
      },
      error: (err) => {
        this.loadingTable = false;
      }
    });
  }

  getProvincias() {
    this.provinciaService.getAll().subscribe((data: Provincia[]) => {
      this.provincias = data;
    }, err => {
      console.log("error:" + err.error?.message);
    });
  }

  getCantones() {
    const provincia = this.myForm.get('provincia').value;
    if (!provincia) {
      this.cantones = [];
      return;
    }
    this.cantonService.getByProvincia(provincia).subscribe((data: Canton[]) => {
      this.cantones = data;
    }, err => {
      console.log("error:" + err.error?.message);
    });
  }

  getParroquias() {
    const provincia = this.myForm.get('provincia').value;
    const canton = this.myForm.get('canton').value;
    if (!provincia || !canton) {
      this.parroquias = [];
      return;
    }
    this.parroquiaService.getByCantonAndProvincia(canton, provincia).subscribe((data: Parroquia[]) => {
      this.parroquias = data;
    }, err => {
      console.log("error:" + err.error?.message);
    });
  }

  getRecintos() {
    const body = {
      provincia: this.myForm.get('provincia').value,
      canton: this.myForm.get('canton').value,
      parroquia: this.myForm.get('parroquia').value
    };
    if (!body.provincia || !body.canton || !body.parroquia) {
      this.recintos = [];
      return;
    }
    this.recintoService.getByFilter(body).subscribe((data: RecintoElectoral[]) => {
      this.recintos = data;
    }, err => {
      console.log("error:" + err.error?.message);
    });
  }

  changeProvincia() {
    this.myForm.patchValue({ canton: '', parroquia: '', recinto_electoral: null });
    this.parroquias = [];
    this.recintos = [];
    this.getCantones();
  }

  changeCanton() {
    this.myForm.patchValue({ parroquia: '', recinto_electoral: null });
    this.recintos = [];
    this.getParroquias();
  }

  changeParroquia() {
    this.myForm.patchValue({ recinto_electoral: null });
    this.getRecintos();
  }

  showModal() {
    this.displayModal = true;
  }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }

  limpiarForm() {
    this.myForm.reset();
    this.displayModal = false;
    this.editMod = false;
    this.indexUsuarioSelected = null;
    this.usuarioRoles = [];
  }

  onSubmit() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.sweetAlert.showMessage('error', 'Debe ingresar la información requerida');
      return;
    }
    if (this.usuarioRoles.length == 0) {
      this.sweetAlert.showMessage('error', 'Asigne por lo menos un rol');
      return;
    }
    const { rol, ...datos } = this.myForm.getRawValue();
    const body = { ...datos, roles: this.usuarioRoles };

    this.sweetAlert.showMessage('loading');
    const peticion = this.editMod == true
      ? this.usuarioService.update({ ...body, id: this.usuarios[this.indexUsuarioSelected].id })
      : this.usuarioService.createByAdmin(body);

    peticion.subscribe({
      next: (result: any) => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success', result.message);
        this.limpiarForm();
        this.onCallUsuarios();
      },
      error: (err) => {
        this.sweetAlert.showMessage('error', err.error?.message || 'No se pudo guardar el usuario');
      }
    });
  }

  add() {
    this.limpiarForm();
    this.configurarModo(false);
    this.cantones = [];
    this.parroquias = [];
    this.recintos = [];
    this.displayModal = true;
    this.editMod = false;
  }

  edit(usuario: any) {
    this.configurarModo(true);
    this.myForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      identificacion: usuario.identificacion,
      telefono: usuario.telefono,
      genero: usuario.genero,
      provincia: usuario.provincia_codigo,
      canton: usuario.canton_codigo,
      parroquia: usuario.parroquia_codigo,
      recinto_electoral: usuario.recinto_electoral,
      numero_junta: usuario.numero_junta,
      contrasenia: '',
      rol: ''
    });
    this.getCantones();
    this.getParroquias();
    this.getRecintos();
    this.indexUsuarioSelected = this.usuarios.findIndex(item => item.id == usuario.id);
    this.usuarioRoles = [...(usuario.roles || [])];
    this.displayModal = true;
    this.editMod = true;
  }

  addUsuarioRol() {
    const rol = this.myForm.controls['rol'].value;
    if (!rol) {
      this.sweetAlert.showMessage('error', 'Seleccione un rol');
      return;
    }
    let filterRolExist = this.usuarioRoles.filter(item => item.id == rol.id);
    filterRolExist.length > 0 ? this.sweetAlert.showMessage('error', 'El rol ya existe') : this.usuarioRoles.push(rol);
  }

  removeUsuarioRol(rol: Rol) {
    const index = this.usuarioRoles.indexOf(rol);
    if (this.usuarioRoles.length < 2) {
      this.sweetAlert.showMessage('error', 'Asigne por lo menos un rol')
    } else {
      if (index > -1) {
        this.usuarioRoles.splice(index, 1);
      }
    }
  }

  delete(usuario: Usuario) {
    const index = this.usuarios.findIndex(item => item.id == usuario.id);
    this.confirmationService.confirm({
      target: document.getElementById(`usuario-${usuario.id}`),
      message: '¿Estás seguro de inactivar este registro?',
      key: this.getRandomKey(),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      accept: () => {
        this.sweetAlert.showMessage('loading');
        this.usuarioService.delete(usuario.id).subscribe({
          next: (result: any) => {
            this.sweetAlert.showMessage('close');
            this.sweetAlert.showMessage('success', result.message);
            this.usuarios.splice(index, 1);
            this.onCallUsuariosInactivos();
          },
          complete: () => {
            this.myForm.reset();
          },
          error: (err) => {
            this.sweetAlert.showMessage('error', err.error.message);
          }
        })
      },
      reject: () => {
      }
    });
  }

  reactivar(usuario: Usuario) {
    console.log("usuario a reactivar:",usuario);

    this.sweetAlert.showMessage('loading');
    this.usuarioService.reactivate(usuario.id).subscribe({
      next: (result: any) => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success', result.message);
        this.onCallUsuariosInactivos();
        this.onCallUsuarios();
      },
      complete: () => {
        this.myForm.reset();
      },
      error: (err) => {
        this.sweetAlert.showMessage('error', err.error.message);
      }
    })
  }

  onHide() {
    this.myForm.reset();
    this.editMod = false;
    this.indexUsuarioSelected = null;
    this.usuarioRoles = [];
  }

  getRandomKey() {
    if (this.keyConfirmPopup == 'conf-1') {
      this.keyConfirmPopup = 'conf-2';
    } else {
      this.keyConfirmPopup = 'conf-1';
    }
    console.log(this.keyConfirmPopup);
    return this.keyConfirmPopup;
  }

}
