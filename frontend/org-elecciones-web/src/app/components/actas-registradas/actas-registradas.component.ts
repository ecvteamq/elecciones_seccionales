import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Acta } from 'src/app/models/acta.model';
import { ActaDetalle } from 'src/app/models/acta_detalle.model';
import { ActaService } from 'src/app/services/acta.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import { Validaciones } from 'src/app/utils/validaciones';

@Component({
  selector: 'app-actas-registradas',
  templateUrl: './actas-registradas.component.html',
  styleUrls: ['./actas-registradas.component.scss']
})
export class ActasRegistradasComponent implements OnInit {

  actas: Acta[];
  loadingTable: boolean;
  matchModeOptions: SelectItem[];
  public displayModal: Boolean;
  public myForm: FormGroup;
  editMod: Boolean;
  public sweetAlert: SweetalertConfig;
  public vl: Validaciones;
  indexActaSelected: number;
  detalles: ActaDetalle[];
  actaId: bigint;

  constructor(
    private actaService: ActaService,
    private formBuilder: FormBuilder,
  ) {
    this.actas = [];
    this.vl = new Validaciones();
    this.sweetAlert = new SweetalertConfig();
    this.detalles = [];
  }

  ngOnInit(): void {
    this.buildForm();
    this.getActas();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      total_votante: ['', [Validators.required]],
      voto_valido: ['', [Validators.required]],
      voto_blanco: ['', [Validators.required]],
      voto_nulo: ['', [Validators.required]],
      inasistente: ['', [Validators.required]]
    });
  }

  getActas() {
    this.actaService.getAll().subscribe((data: Acta[]) => {
      this.actas = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  edit(acta: Acta) {
    this.actaId = acta.id;
    this.myForm.patchValue({
      "total_votante": acta.total_votante,
      "voto_valido": acta.voto_valido,
      "voto_blanco": acta.voto_blanco,
      "voto_nulo": acta.voto_nulo,
      "inasistente": acta.inasistente
    });
    this.myForm.get('inasistente').disable();
    this.indexActaSelected = this.actas.findIndex(item => item.id == acta.id);
    this.displayModal = true;
    this.editMod = true;
    this.actaService.getActaDetalleById(acta.id).subscribe(data => {
      if (data) {
        this.detalles = data;
      }
    });
  }

  disabledDetail(event) {
    console.log("event:", event);
    if (event.key == 'Tab') {
      event.target.disabled = true;
    }
  }

  actualizarVotosValidos() {
    let sumaVotos = 0;
    this.detalles.forEach(detalle => {
      sumaVotos += Number(detalle.voto);
    });

    let diferencia = Number(this.myForm.get('total_votante').value) - sumaVotos;
    if (diferencia < 0) {
      let resultado = Number(this.myForm.get('total_votante').value) + Math.abs(diferencia);
      this.myForm.get('voto_valido').setValue(resultado);
    } else {
      let resultado = Number(this.myForm.get('total_votante').value) - diferencia;
      this.myForm.get('voto_valido').setValue(resultado);
    }
    this.calcularInasistentes();
  }

  calcularInasistentes() {
    this.myForm.controls['inasistente'].setValue(this.myForm.get('total_votante').value
      - this.myForm.get('voto_valido').value - this.myForm.get('voto_blanco').value - this.myForm.get('voto_nulo').value);
  }

  onHide() {
    this.myForm.reset();
    this.editMod = false;
    this.indexActaSelected = null;
  }

  limpiarForm() {
    this.myForm.reset();
    this.displayModal = false;
    this.editMod = false;
    this.indexActaSelected = null;
  }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }


  validarActa(): boolean {
    let count = 0;
    let error = false;
    this.detalles.forEach((detalle: ActaDetalle) => {
      if (detalle.voto == undefined) {
        error = true;
      }
      count++;
    });

    if (count == this.detalles.length) {
      if (error) {
        this.sweetAlert.showMessage('error', 'Las cantidades de votos son nulas');
        return false;
      }
    }

    if (Number(this.myForm.get('total_votante').value) < Number(this.myForm.get('voto_valido').value)) {
      this.sweetAlert.showMessage('error', 'La cantidad de votos candidatos no debe superar al total de empadronados');
      return false;
    }

    if (Number(this.myForm.get('inasistente').value) < 0) {
      this.sweetAlert.showMessage('error', 'La cantidad de inasistentes no debe ser menor a 0 ');
      return false;
    }

    if (Number(this.myForm.get('total_votante').value) <= 0) {
      this.sweetAlert.showMessage('error', 'El total de votantes no debe ser 0');
      return false;
    }

    if (this.myForm.get('voto_valido').value == '') {
      this.sweetAlert.showMessage('error', 'Debe ingresar total de votos empadronados');
      return false;
    }

    return true;
  }

  onSubmit() {
    if (this.validarActa()) {
      let body = {
        "acta": this.actaId,
        "detalles": this.detalles,
        "total_votante": this.myForm.get('total_votante').value,
        "voto_valido": this.myForm.get('voto_valido').value,
        "voto_blanco": this.myForm.get('voto_blanco').value,
        "voto_nulo": this.myForm.get('voto_nulo').value,
        "inasistente": this.myForm.get('inasistente').value,
      }
      this.sweetAlert.showMessage('loading');
      this.actaService.update(body).subscribe((data: any) => {
        console.log("entro");

        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success');
        this.limpiarForm();
        this.getActas();
      }, err => {
        console.log("hubo un error:", err);
      });
    }
  }

}
