import { T } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Acta } from 'src/app/models/acta.model';
import { ActaDetalle } from 'src/app/models/acta_detalle.model';
import { Candidato } from 'src/app/models/candidato.model';
import { Canton } from 'src/app/models/canton.model';
import { Dignidad } from 'src/app/models/dignidad.model';
import { Parroquia } from 'src/app/models/parroquia.model';
import { Provincia } from 'src/app/models/provincia.model';
import { RecintoElectoral } from 'src/app/models/recinto_electoral.model';
import { ActaService } from 'src/app/services/acta.service';
import { AuthService } from 'src/app/services/auth.service';
import { CandidatoService } from 'src/app/services/candidato.service';
import { CantonService } from 'src/app/services/canton.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { RecintoElectoralService } from 'src/app/services/recinto_electoral.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';
import { Valores } from 'src/app/utils/valores';

@Component({
  selector: 'app-generar-acta',
  templateUrl: './generar-acta.component.html',
  styleUrls: ['./generar-acta.component.scss']
})
export class GenerarActaComponent implements OnInit {

  public provincias: Provincia[];
  myForm: FormGroup;
  selectDignidad: string;
  public dignidades: Dignidad[];
  public candidatos: Candidato[];
  public cantones: Canton[];
  public parroquias: Parroquia[];
  public vl: Validaciones;
  public votaciones: any[];
  loadingTable: boolean;
  public sweetAlert: SweetalertConfig;
  public recintos: RecintoElectoral[];
  public acta: any;
  public actaDetalle: ActaDetalle[];
  public total_validos: number;
  public desbloqueoTotal: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private dignidadService: DignidadService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private authService: AuthService,
    private parroquiaService: ParroquiaService,
    private candidatoService: CandidatoService,
    private recintoService: RecintoElectoralService,
    private actaService: ActaService,
  ) {
    this.provincias = [];
    this.cantones = [];
    this.actaDetalle = [];
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.total_validos = 0;
  }

  ngOnInit(): void {
    this.buildForm();
    this.getDignidades();
    this.getProvincias();
    this.setValueForm();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      dignidad: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      parroquia: ['',],
      genero: ['', [Validators.required]],
      numero_junta: ['', [Validators.pattern("^[0-9]*$")]],
      total_votantes: [0],
      votos_validos: [0, Validators.required],
      votos_blancos: [0],
      votos_nulos: [0],
      recinto: [''],
      inasistentes: [0, Validators.required],
      numero_acta: [{ value: 'GENERADO POR EL SISTEMA', disabled: true }],
      tipo_acta: ['']
    });
  }


  private setValueForm() {
    if (this.authService.usuarioSession.provincia.codigo != "" && this.authService.usuarioSession.canton.codigo != ""
      && this.authService.usuarioSession.parroquia.codigo != "") {
      this.myForm.patchValue({
        provincia: this.authService.usuarioSession.provincia.codigo,
        genero: this.authService.usuarioSession.genero
      });
      this.getCantones();
      this.myForm.get('canton').setValue(this.authService.usuarioSession.canton.codigo);
      this.getParroquiaByCanton();
      // this.myForm.get('parroquia').setValue(this.authService.usuarioSession.parroquia.codigo);
    }
    // this.myForm.get('total_votantes').disable();
    this.myForm.get('inasistentes').disable();
    this.myForm.get('tipo_acta').setValue('G');

  }

  getProvincias() {
    this.provinciaService.getAll().subscribe((data: Provincia[]) => {
      this.provincias = data;
    }, err => {
      console.log("error:" + err.error.message);
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
    console.log("get parroquia by canton");

    if (this.myForm.get('tipo_acta').value != 'ST') {
      if (this.myForm.get('canton').value != "") {
        if (this.myForm.get('canton').value == Valores.COGIGO_IBARRA) {
          this.myForm.get('numero_junta').setValidators([Validators.required]);
        } else {
          this.myForm.get('numero_junta').clearValidators();
        }
        this.getRecintos();
        this.parroquiaService.getByCantonAndProvincia(this.myForm.get('canton').value, this.myForm.get('provincia').value).subscribe((data: Parroquia[]) => {
          this.parroquias = data;
        }, err => {
          // this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
          console.log("error:" + err.error.message);
        });
      }
    } else {
      let body = {
        "canton": this.myForm.get('canton').value,
        "provincia": this.myForm.get('provincia').value
      }
      this.recintoService.getNroElectoresByCanton(body).subscribe(data => {
        if (data == null) {
          this.myForm.get('total_votantes').setValue(0);
        } else {
          this.myForm.get('total_votantes').setValue(data.numero_electores);
        }

      });
    }

  }

  getRecintos() {
    let body = {
      provincia: this.myForm.get('provincia').value,
      canton: this.myForm.get('canton').value,
      parroquia: this.myForm.get('parroquia').value
    }

    this.recintoService.getByFilter(body).subscribe((data: RecintoElectoral[]) => {
      this.recintos = data;
    }, err => {
      console.log("error:" + err.error.message);
    });

  }

  getDignidades() {
    this.dignidadService.getAll().subscribe((data: Dignidad[]) => {
      this.dignidades = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  validarCabecera(): boolean {
    if (this.myForm.get('dignidad').value == '') {
      this.sweetAlert.showMessage('error', 'Debe ingresar la dignidad');
      return false;
    }
    if (this.myForm.get('provincia').value == '') {
      this.sweetAlert.showMessage('error', 'Debe ingresar la provincia');
      return false;
    }
    if (this.myForm.get('canton').value == '') {
      this.sweetAlert.showMessage('error', 'Debe ingresar el cantón');
      return false;
    }
    if(this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_VOCALES){
      if (this.myForm.get('parroquia').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar la parroquia');
        return false;
      }
    }
    if (this.myForm.get('canton').value == Valores.COGIGO_IBARRA) {
      if (this.myForm.get('numero_junta').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar el numero de junta');
        return false;
      }
    }

    if (this.myForm.get('genero').value == '') {
      this.sweetAlert.showMessage('error', 'Debe ingresar el genero');
      return false;
    }
    if (this.myForm.get('canton').value == Valores.COGIGO_IBARRA) {
      if (this.myForm.get('recinto').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar el recinto electoral');
        return false;
      }
    }
    return true;
  }

  limpiarTotales() {
    this.total_validos = 0;
    this.myForm.get('total_votantes').setValue(0);
    this.myForm.get('votos_validos').setValue(0);
    this.myForm.get('votos_blancos').setValue(0);
    this.myForm.get('votos_nulos').setValue(0);
    this.myForm.get('inasistentes').setValue(0);
  }

  buscarCandidatos() {
    this.limpiarTotales();
    if (this.validarCabecera()) {
      let body = {
        provincia: this.myForm.get('provincia').value,
        canton: this.myForm.get('canton').value,
        parroquia: this.myForm.get('parroquia').value,
        dignidad: this.myForm.get('dignidad').value
      }
      this.sweetAlert.showMessage('loading');
      this.candidatoService.getByFilter(body).subscribe((data: Candidato[]) => {
        this.sweetAlert.showMessage('close');
        this.candidatos = data;
      }, err => {
        console.log("error:" + err.error.message);
      });
    }
  }

  calcularInasistentes() {
    this.myForm.controls['inasistentes'].setValue(this.myForm.get('total_votantes').value
      - this.myForm.get('votos_validos').value - this.myForm.get('votos_blancos').value - this.myForm.get('votos_nulos').value);
  }

  obtenerDatosRecinto() {
    this.myForm.get('total_votantes').setValue(this.myForm.get('recinto').value.numero_electores);
  }

  // actualizarVotosValidos(event, candidato: Candidato) {
  //   // if(event.target.value){
  //   //   this.myForm
  //   // }
  //   console.log("event:", parseInt(event.target.value));
  //   this.total_validos += Number(event.target.value);
  //   this.myForm.get('votos_validos').setValue(this.total_validos);
  // }

  actualizarVotosValidos() {
    let sumaVotos = 0;
    this.candidatos.forEach(detalle => {
      console.log("votos:",detalle.votos);
      if(detalle.votos != undefined)
        sumaVotos += Number(detalle.votos);
    });
    console.log("suma de votos:",sumaVotos);
    
    let diferencia = Number(this.myForm.get('total_votantes').value) - sumaVotos;
    if (diferencia < 0) {
      let resultado = Number(this.myForm.get('total_votantes').value) + Math.abs(diferencia);
      this.myForm.get('votos_validos').setValue(resultado);
    } else {
      let resultado = Number(this.myForm.get('total_votantes').value) - diferencia;
      this.myForm.get('votos_validos').setValue(resultado);
    }
    this.calcularInasistentes();
  }

  validarActa(): boolean {
    let count = 0;
    let error = false;
    this.candidatos.forEach((candidato: Candidato) => {
      if (candidato.votos == undefined || candidato.votos == 0) {
        error = true;
      }
      count++;
    });

    // if (count == this.candidatos.length) {
    //   if (error) {
    //     this.sweetAlert.showMessage('error', 'Las cantidades de votos son nulas o estan en 0');
    //     return false;
    //   }
    // }

    if (Number(this.myForm.get('total_votantes').value) < Number(this.myForm.get('votos_validos').value)) {
      this.sweetAlert.showMessage('error', 'La cantidad de votos válidos no debe superar al total de votantes');
      return false;
    }

    if (Number(this.myForm.get('inasistentes').value) < 0) {
      this.sweetAlert.showMessage('error', 'La cantidad de inasistentes no debe ser menor a 0 ');
      return false;
    }

    if (Number(this.myForm.get('total_votantes').value) <= 0) {
      this.sweetAlert.showMessage('error', 'El total de votantes no debe ser 0');
      return false;
    }

    return true;
  }

  desbloquearTotales() {
    if (this.myForm.get('tipo_acta').value === 'ST') {
      this.myForm.get('total_votantes').enable();
      this.myForm.get('inasistentes').enable();
    }
    else {
      this.myForm.get('total_votantes').disable();
      this.myForm.get('inasistentes').disable();
    }
  }

  generarActa() {
    if (this.myForm.get('tipo_acta').value != 'ST') {
      if (this.validarActa()) {
        let body = {
          "provincia": this.myForm.get('provincia').value,
          "canton": this.myForm.get('canton').value,
          "parroquia": this.myForm.get('parroquia').value,
          "recinto_electoral": this.myForm.get('recinto').value,
          "numero_junta": this.myForm.get('numero_junta').value,
          "genero": this.myForm.get('genero').value,
          "dignidad": this.myForm.get('dignidad').value,
          "detalles": this.candidatos,
          "total_votantes": this.myForm.get('total_votantes').value,
          "votos_validos": this.myForm.get('votos_validos').value,
          "votos_blancos": this.myForm.get('votos_blancos').value,
          "votos_nulos": this.myForm.get('votos_nulos').value,
          "inasistentes": this.myForm.get('inasistentes').value,
          "tipo_acta": this.myForm.get('tipo_acta').value
        }
        if (this.myForm.valid && this.myForm.get('votos_validos').value != '') {
          this.sweetAlert.showMessage('loading');
          this.actaService.save(body).subscribe((data: any) => {
            console.log("data create:" + JSON.stringify(data));
            console.log("data nro:" + JSON.stringify(data.data.numero_acta));
            if (data) {
              this.sweetAlert.showMessage('close');
              this.sweetAlert.showMessage('success', "Número de acta: " + JSON.stringify(data.data.numero_acta));
              this.ngOnInit();
              this.candidatos = [];
            }
          }, err => {
            console.log("hubo un error:", err);
          });
        } else {
          this.sweetAlert.showMessage('error', 'Debe ingresar los valores requeridos');
        }
      }
    } else {
      if (this.myForm.get('votos_validos').value != '' && this.myForm.get('total_votantes').value != '' &&
        this.myForm.get('votos_blancos').value != '' && this.myForm.get('votos_nulos').value != ''
        && this.myForm.get('inasistentes').value != '') {
        let body = {
          "provincia": this.myForm.get('provincia').value,
          "canton": this.myForm.get('canton').value,
          "total_votantes": this.myForm.get('total_votantes').value,
          "votos_validos": this.myForm.get('votos_validos').value,
          "votos_blancos": this.myForm.get('votos_blancos').value,
          "votos_nulos": this.myForm.get('votos_nulos').value,
          "inasistentes": this.myForm.get('inasistentes').value,
          "dignidad": this.myForm.get('dignidad').value
        }
        this.sweetAlert.showMessage('loading');
        this.actaService.saveOnlyTotal(body).subscribe((data: any) => {
          if (data) {
            this.sweetAlert.showMessage('close');
            this.sweetAlert.showMessage('success', "Número de acta: " + JSON.stringify(data.data.numero_acta));
            this.ngOnInit();
          }
        }
        );
      } else {
        this.sweetAlert.showMessage('error', 'Debe ingresar los valores totales');
      }

    }

  }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }

}
