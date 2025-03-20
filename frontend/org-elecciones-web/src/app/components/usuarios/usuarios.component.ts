import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Rol } from 'src/app/models/rol.model';
import { Usuario } from 'src/app/models/usuario.model';
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
    private rolService: RolService
  ) {
    this.displayModal = false;
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.primaryColor = Valores.primaryColor;
    this.usuarioRoles = [];
    this.matchModeOptions = [
      { label: 'Contiene', value: 'contains' },
    ];
  }

  ngOnInit(): void {
    this.onForm();
    this.onCallUsuarios();
    this.onCallUsuariosInactivos();
    this.onCallRoles();
  }



  onForm() {
    this.myForm = this.formBuilder.group({
      nombre: [{ value: '', disabled: true }],
      apellido: [{ value: '', disabled: true }],
      identificacion: [{ value: '', disabled: true }],
      rol: [''],
      canton_nombre: [{ value: '', disabled: true }],
      parroquia_nombre: [{ value: '', disabled: true }],
      provincia_nombre: [{ value: '', disabled: true }],
      recinto_nombre: [{ value: '', disabled: true }],
      numero_junta: [{ value: '', disabled: true }],
    });
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
  }

  onSubmit() {
    this.sweetAlert.showMessage('loading');
    if (this.editMod == true) {
      const usuario_updated = { ...this.usuarios[this.indexUsuarioSelected], ...this.myForm.value };
      // console.log("usuario updated:",usuario_updated);
      // return;
      this.usuarioService.update(usuario_updated).subscribe({
        next: (result: any) => {
          this.sweetAlert.showMessage('close');
          this.sweetAlert.showMessage('success', result.message);
          this.displayModal = false;
          this.usuarios[this.indexUsuarioSelected] = usuario_updated;
        },
        complete: () => {
          this.myForm.reset();
        },
        error: (err) => {
          this.sweetAlert.showMessage('error', err.error.message);
        }
      });
    } else {
      this.usuarioService.save(this.myForm.value).subscribe({
        next: (result: any) => {
          this.sweetAlert.showMessage('close');
          this.sweetAlert.showMessage('success', result.message);
          this.displayModal = false;
          this.usuarios.push({ ...this.myForm.value, id: result.data });
          // if(result && result.success && result.data != null && result.data != undefined) {
          // }
        },
        complete: () => {
          this.myForm.reset();
        },
        error: (err) => {
          this.sweetAlert.showMessage('error', err.error.message);
        }
      });
    }
  }

  edit(usuario: Usuario) {
    console.log("usuario:",usuario);
    this.myForm.patchValue(usuario);
    this.indexUsuarioSelected = this.usuarios.findIndex(item => item.id == usuario.id);
    this.usuarioRoles = usuario.roles;
    this.displayModal = true;
    this.editMod = true;
  }

  addUsuarioRol() {
    let filterRolExist = this.usuarioRoles.filter(item => item.id == this.myForm.controls['rol'].value.id);
    filterRolExist.length > 0 ? this.sweetAlert.showMessage('error', 'El rol ya existe') : this.usuarioRoles.push(this.myForm.controls['rol'].value);
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
