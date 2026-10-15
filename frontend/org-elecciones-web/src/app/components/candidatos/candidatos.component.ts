import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Candidato } from 'src/app/models/candidato.model';
import { Canton } from 'src/app/models/canton.model';
import { Dignidad } from 'src/app/models/dignidad.model';
import { Distrito } from 'src/app/models/distrito.model';
import { Parroquia } from 'src/app/models/parroquia.model';
import { Provincia } from 'src/app/models/provincia.model';
import { CandidatoService } from 'src/app/services/candidato.service';
import { CantonService } from 'src/app/services/canton.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { DistritoService } from 'src/app/services/distrito.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';
import { parroquiasDeDistritos } from 'src/app/utils/distritos';

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
  distritos: Distrito[];
  opcionesFiltro: { provincia: SelectItem[], canton: SelectItem[], parroquia: SelectItem[], distrito: SelectItem[] } = { provincia: [], canton: [], parroquia: [], distrito: [] };

  constructor(
    private confirmationService: ConfirmationService,
    private candidatoService: CandidatoService,
    private dignidadService: DignidadService,
    private provinciaService: ProvinciaService,
    private formBuilder: FormBuilder,
    private parroquiaService: ParroquiaService,
    private cantonService: CantonService,
    private distritoService: DistritoService
  ) {
    this.provincias = [];
    this.cantones = [];
    this.parroquias = [];
    this.distritos = [];
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
      distrito: [null],
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
        this.cargarOpcionesFiltro();
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

  /** Valores distintos de cada columna para los combos de filtro de la tabla. */
  private cargarOpcionesFiltro() {
    const distintos = (valores: string[]) => [...new Set(valores.filter(v => !!v))].sort()
      .map(v => ({ label: v, value: v }));
    const candidatos: any[] = this.candidatos || [];
    this.opcionesFiltro = {
      provincia: distintos(candidatos.map(c => c.provincia?.nombre)),
      canton: distintos(candidatos.map(c => c.canton?.nombre)),
      parroquia: distintos(candidatos.map(c => c.parroquia)),
      distrito: distintos(candidatos.map(c => c.distrito?.nombre))
    };
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
      "id": candidato.id,
      "distrito": candidato.distrito?.id ?? null
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
      this.sincronizarDistrito();
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

  /**
   * Los concejales se eligen por distrito: carga los distritos del cantón para la dignidad
   * seleccionada. Si no hay distritos configurados, el candidato no se asocia a ninguno.
   */
  getDistritos(distritoSeleccionado?: number) {
    const provincia = this.myForm.get('provincia').value;
    const canton = this.myForm.get('canton').value;
    const dignidad = this.dignidades.find(d => d.descripcion == this.myForm.get('dignidad').value);
    if (!provincia || !canton || !dignidad) {
      this.distritos = [];
      this.myForm.get('distrito').setValue(null);
      return;
    }
    this.distritoService.getByCanton(provincia, canton, dignidad.id).subscribe((data: Distrito[]) => {
      this.distritos = data;
      const existe = data.some(d => d.id == distritoSeleccionado);
      this.myForm.get('distrito').setValue(existe ? distritoSeleccionado : null);
      this.limpiarParroquiaInvalida();
      this.sincronizarDistrito();
    }, err => {
      console.log("error:" + err.error?.message);
    });
  }

  /** Distrito al que pertenece la parroquia elegida (si la parroquia está en alguno). */
  get distritoDeParroquia(): Distrito {
    const parroquia = this.myForm.get('parroquia').value;
    return parroquia ? this.distritos.find(d => d.parroquias.some(p => p.codigo == parroquia)) : undefined;
  }

  /** Parroquias que pertenecen a los distritos de la dignidad (o al distrito elegido). */
  get parroquiasDisponibles(): Parroquia[] {
    return parroquiasDeDistritos(this.parroquias, this.distritos, this.myForm.get('distrito').value);
  }

  /** Quita la parroquia si no pertenece a los distritos de la dignidad (p. ej. rural en concejales urbanos). */
  limpiarParroquiaInvalida() {
    const parroquia = this.myForm.get('parroquia').value;
    if (parroquia && !this.parroquiasDisponibles.some(p => p.codigo == parroquia)) {
      this.myForm.get('parroquia').setValue('');
    }
  }

  /** Si hay parroquia, solo se ofrece su distrito; si no, todos los del cantón. */
  get distritosDisponibles(): Distrito[] {
    const distrito = this.distritoDeParroquia;
    return distrito ? [distrito] : this.distritos;
  }

  /** La parroquia determina el distrito: se asigna solo y no puede contradecirla. */
  sincronizarDistrito() {
    const distrito = this.distritoDeParroquia;
    if (distrito) {
      this.myForm.get('distrito').setValue(distrito.id);
    }
  }

  nombresParroquias(distrito: Distrito): string {
    return (distrito.parroquias || []).map(p => p.nombre).join(', ');
  }

  getParroquiaByCanton() {
    this.getDistritos(this.myForm.get('distrito').value);
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
    this.distritos = [];
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
