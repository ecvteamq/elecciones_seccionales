import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Candidato } from 'src/app/models/candidato.model';
import { Canton } from 'src/app/models/canton.model';
import { Dignidad } from 'src/app/models/dignidad.model';
import { Parroquia } from 'src/app/models/parroquia.model';
import { Provincia } from 'src/app/models/provincia.model';
import { CandidatoService } from 'src/app/services/candidato.service';
import { CantonService } from 'src/app/services/canton.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';

@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.component.html',
  styleUrls: ['./candidatos.component.scss']
})
export class CandidatosComponent implements OnInit {

  candidatos: Candidato[];
  loadingTable: boolean;
  matchModeOptions: SelectItem[];
  public myForm: FormGroup;
  public sweetAlert: SweetalertConfig;
  public vl: Validaciones;
  indexCandidatosSelected: number;
  public displayModal: Boolean;
  editMod: Boolean;
  keyConfirmPopup: string;
  dignidades: Dignidad[];
  provincias: Provincia[];
  cantones: Canton[];
  parroquias: Parroquia[];

  constructor(
    private confirmationService: ConfirmationService,
    private candidatoService: CandidatoService,
    private dignidadService: DignidadService,
    private provinciaService: ProvinciaService,
    private formBuilder: FormBuilder,
    private parroquiaService: ParroquiaService,
    private cantonService: CantonService
  ) {
    this.provincias = [];
    this.cantones = [];
    this.parroquias = [];
    this.dignidades = [];
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
  }

  ngOnInit(): void {
    this.buildForm();
    this.getDignidades();
    this.getProvincias();
    this.getCandidatos();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      dignidad: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      parroquia: ['',],
      nombre: ['', [Validators.required]],
      nombre_papeleta: ['', [Validators.required]],
      lista: ['', [Validators.required]],
      partido: ['', [Validators.required]],
      id: ['']
    });
  }


  getProvincias() {
    this.provinciaService.getAll().subscribe((data: Provincia[]) => {
      this.provincias = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  getCandidatos() {
    this.loadingTable = true;
    this.candidatoService.getAll().subscribe({
      next: (data: Candidato[]) => {
        this.candidatos = data;
      },
      complete: () => {
        this.loadingTable = false;
      },
      error: (err) => {
        this.loadingTable = false;
        console.log("error:", err);
      }
    });
  }

  getDignidades() {
    this.dignidadService.getAll().subscribe((data: Dignidad[]) => {
      this.dignidades = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  onSubmit() {
    console.log("form value:", this.myForm.value);

    this.sweetAlert.showMessage('loading');
    if (this.editMod == true) {
      const usuario_updated = { ...this.candidatos[this.indexCandidatosSelected], ...this.myForm.value };
      console.log("usuario updated:", usuario_updated);

      this.candidatoService.update(usuario_updated).subscribe({
        next: (result: any) => {
          this.sweetAlert.showMessage('close');
          this.sweetAlert.showMessage('success', result.message);
          this.displayModal = false;
          // this.candidatos[this.indexCandidatosSelected] = usuario_updated;
          this.getCandidatos();
        },
        complete: () => {
          this.myForm.reset();
        },
        error: (err) => {
          this.sweetAlert.showMessage('error', err.error.message);
        }
      });
    } else {
      this.candidatoService.save(this.myForm.value).subscribe({
        next: (result: any) => {
          this.sweetAlert.showMessage('close');
          this.sweetAlert.showMessage('success', result.message);
          this.displayModal = false;
          // this.candidatos.push({ ...this.myForm.value, id: result.data });
          this.getCandidatos();
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

  add() {
    this.displayModal = true;
    this.editMod = false;
  }

  edit(candidato: any) {
    console.log("candidato:", candidato);
    this.myForm.patchValue({
      "dignidad": candidato.dignidad?.descripcion,
      "provincia": candidato.provincia?.codigo,
      "nombre": candidato.nombre,
      "lista": candidato.lista,
      "nombre_papeleta": candidato.nombre_papeleta,
      "partido": candidato.partido,
      "id": candidato.id
    });
    this.getCantones();
    this.myForm.get('canton').setValue(candidato.canton?.codigo);
    this.getParroquiaByCanton();
    let body = {
      "nombre":candidato.parroquia,
      "provincia":candidato.provincia.codigo,
      "canton":candidato.canton.codigo
    }
    this.parroquiaService.findByNombre(body).subscribe((data:any) => {
      console.log("data parroquia:", data);
      this.myForm.get('parroquia').setValue(data.parroquia.codigo);
    });
    this.indexCandidatosSelected = this.candidatos.findIndex(item => item.id == candidato.id);
    this.displayModal = true;
    this.editMod = true;
  }

  // getParroquiaNombre(parroquiaId): string {
  //   if (parroquiaId != null) {
  //     console.log("parroquiaid:",parroquiaId);
      
  //     this.parroquiaService.getById(parroquiaId).subscribe(data => {
  //       if (data) {
  //         console.log("entro retorno");

  //         return data.nombre;
  //       }
  //       return "";
  //     });
  //   }
  //   return "";
  // }

  delete(recinto: Candidato) {
    const index = this.candidatos.findIndex(item => item.id == recinto.id);
    this.confirmationService.confirm({
      target: document.getElementById(`recinto-${recinto.id}`),
      message: '¿Estás seguro de inactivar este registro?',
      key: this.getRandomKey(),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      accept: () => {
        this.sweetAlert.showMessage('loading');
        this.candidatoService.delete(recinto.id).subscribe({
          next: (result: any) => {
            this.sweetAlert.showMessage('close');
            this.sweetAlert.showMessage('success', result.message);
            this.getCandidatos();
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

  getCantones() {

    this.cantonService.getByProvincia(this.myForm.get('provincia').value).subscribe((data: Canton[]) => {
      this.cantones = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  getParroquiaByCanton() {
    if (this.myForm.get('canton').value != "") {
      this.parroquiaService.getByCantonAndProvincia(this.myForm.get('canton').value, this.myForm.get('provincia').value).subscribe((data: Parroquia[]) => {
        this.parroquias = data;
      }, err => {
        // this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
        console.log("error:" + err.error.message);
      });
    }
  }

  onHide() {
    this.myForm.reset();
    this.editMod = false;
    this.indexCandidatosSelected = null;
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

  limpiarForm() {
    this.myForm.reset();
    this.displayModal = false;
    this.editMod = false;
    this.indexCandidatosSelected = null;
  }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }


}
