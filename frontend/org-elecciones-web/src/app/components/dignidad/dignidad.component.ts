import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Dignidad } from 'src/app/models/dignidad.model';
import { Rol } from 'src/app/models/rol.model';
import { Usuario } from 'src/app/models/usuario.model';
import { DignidadService } from 'src/app/services/dignidad.service';
import { RecintoElectoralService } from 'src/app/services/recinto_electoral.service';
import { RolService } from 'src/app/services/rol.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';
import { Valores } from 'src/app/utils/valores';

@Component({
  selector: 'app-dignidad',
  templateUrl: './dignidad.component.html',
  styleUrls: ['./dignidad.component.scss']
})
export class DignidadComponent implements OnInit {

  public displayModal: Boolean;
  public myForm: FormGroup;
  public sweetAlert: SweetalertConfig;
  public vl: Validaciones;
  public dignidades: Dignidad[];
  public usuariosInactivos: Usuario[];
  public usuarioRoles: Rol[];
  loadingTable: boolean;
  editMod: Boolean;
  indexRecintoSelected: number;
  keyConfirmPopup: string;
  public primaryColor: string;
  matchModeOptions: SelectItem[];

  constructor(
    public formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private dignidadService: DignidadService,
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
    this.onCallDignidad();
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

  onCallDignidad() {
    this.loadingTable = true;
    this.dignidadService.getAll().subscribe({
      next: (dignidades: Dignidad[]) => {
        this.dignidades = dignidades;
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
    this.indexRecintoSelected = null;
  }

  onSubmit() {
    this.sweetAlert.showMessage('loading');
    if (this.editMod == true) {
      const usuario_updated = { ...this.dignidades[this.indexRecintoSelected], ...this.myForm.value };
      // this.dignidadService.update(usuario_updated).subscribe({
      //   next: (result: any) => {
      //     this.sweetAlert.showMessage('close');
      //     this.sweetAlert.showMessage('success', result.message);
      //     this.displayModal = false;
      //     this.dignidades[this.indexRecintoSelected] = usuario_updated;
      //   },
      //   complete: () => {
      //     this.myForm.reset();
      //   },
      //   error: (err) => {
      //     this.sweetAlert.showMessage('error', err.error.message);
      //   }
      // });
    } else {
      // this.dignidadService.save(this.myForm.value).subscribe({
      //   next: (result: any) => {
      //     this.sweetAlert.showMessage('close');
      //     this.sweetAlert.showMessage('success', result.message);
      //     this.displayModal = false;
      //     this.dignidades.push({ ...this.myForm.value, id: result.data });
      //     // if(result && result.success && result.data != null && result.data != undefined) {
      //     // }
      //   },
      //   complete: () => {
      //     this.myForm.reset();
      //   },
      //   error: (err) => {
      //     this.sweetAlert.showMessage('error', err.error.message);
      //   }
      // });
    }
  }

  edit(recinto: Dignidad) {
    console.log("recinto:", recinto);
    this.myForm.patchValue(recinto);
    this.indexRecintoSelected = this.dignidades.findIndex(item => item.id == recinto.id);
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

  delete(dignidad: Dignidad) {

    this.sweetAlert.confirm('La información registrada se eliminara, esta acción no se puede revertir').then(resp => {
      this.sweetAlert.showMessage('loading');
      this.dignidadService.delete(dignidad.id).subscribe(res => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success');
        this.onCallDignidad();
      }, err => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('error', err.error.message);
      });
    }, err => {
      console.log("err", err);
      this.sweetAlert.showMessage('close');
      this.sweetAlert.showMessage('error', err.error.message)
    });
  }

  reactivar(usuario: Usuario) {
    console.log("usuario a reactivar:", usuario);

    this.sweetAlert.showMessage('loading');
    // this.dignidadService.reactivate(usuario.id).subscribe({
    //   next: (result: any) => {
    //     this.sweetAlert.showMessage('close');
    //     this.sweetAlert.showMessage('success', result.message);
    //     this.onCallDignidad();
    //   },
    //   complete: () => {
    //     this.myForm.reset();
    //   },
    //   error: (err) => {
    //     this.sweetAlert.showMessage('error', err.error.message);
    //   }
    // })
  }

  onHide() {
    this.myForm.reset();
    this.editMod = false;
    this.indexRecintoSelected = null;
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
