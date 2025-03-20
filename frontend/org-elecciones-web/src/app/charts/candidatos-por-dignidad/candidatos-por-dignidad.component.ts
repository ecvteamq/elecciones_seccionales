import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import "chart.js/auto";
import { ActaDetalle } from 'src/app/models/acta_detalle.model';
import { Dignidad } from 'src/app/models/dignidad.model';
import { ActaService } from 'src/app/services/acta.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
@Component({
  selector: 'app-candidatos-por-dignidad',
  templateUrl: './candidatos-por-dignidad.component.html',
  styleUrls: ['./candidatos-por-dignidad.component.scss']
})
export class CandidatosPorDignidadComponent {
  @Input() dignidad:string= '';
  canvas: any;
  ctx: any;
  public sweetAlert: SweetalertConfig;
  detalles: ActaDetalle[];
  public dignidades: Dignidad[];
  basicData: any;
  basicOptions: any;
  provincia:string = '';
  canton:string= '';
  parroquia:string = '';

  constructor(
    private actaService: ActaService,
    private dignidadService: DignidadService,
  ) {
    this.dignidad = 'ALCALDES MUNICIPALES';
    this.detalles = [];
    this.sweetAlert = new SweetalertConfig();
    this.buscarDetalles();
    console.log("dignidad:",this.dignidad);
    
    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

 
  buscarDetalles(dignidad?,provincia?,canton?,parroquia?) {
    this.dignidad = dignidad ? dignidad : this.dignidad;
    this.provincia = provincia ? provincia : this.provincia;
    this.canton = canton ? canton : this.canton;
    this.parroquia = parroquia ? parroquia : this.parroquia;
    this.sweetAlert.showMessage('loading');

    this.dignidadService.getByDescripcion(this.dignidad).subscribe((data: Dignidad) => {
      console.log("data dignidad:", data);
      let body = {
        "dignidad": data,
        "provincia":this.provincia,
        "canton":this.canton,
        "parroquia":this.parroquia
      }
      this.actaService.getVotos(body).subscribe((result: ActaDetalle[]) => {
        console.log("result reporte:", result);
        if (result) {
          this.sweetAlert.showMessage('close');
          this.detalles = result;

          this.drawChart();
        }
      }, err => {
        console.log("error:" + err.error.message);
      });
    });
  }

  drawChart() {
    this.basicData = {
      labels: this.detalles.map(row => row.candidato.nombre_papeleta ? row.candidato.nombre_papeleta : row.candidato),
      datasets: [
        {
          label: 'Votos',
          data: this.detalles.map(row => row.voto),
          backgroundColor: '#9BD0F5'
        }
      ]
    };
  }

}
