import { Component, OnInit } from '@angular/core';
import "chart.js/auto";
import { ActaService } from 'src/app/services/acta.service';
import { DignidadService } from 'src/app/services/dignidad.service';


@Component({
  selector: 'app-porcentaje-escrutinio',
  templateUrl: './porcentaje-escrutinio.component.html',
  styleUrls: ['./porcentaje-escrutinio.component.scss']
})
export class PorcentajeEscrutinioComponent implements OnInit {

  basicData: any;
  basicOptions: any;
  porcentajes: any;
  dignidad: string;

  constructor(
    private actaService: ActaService,
    private dignidadService: DignidadService
  ) {
    this.porcentajes = [];
    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      }
    };
    this.dignidad = 'ALCALDES MUNICIPALES';
  }

  ngOnInit(): void {
    this.getPorcentajes();
    // this.drawChart();
  }

  getPorcentajes(dignidad?) {
    this.dignidad = dignidad ? dignidad : this.dignidad;
    this.dignidadService.getByDescripcion(this.dignidad).subscribe(dignidad => {
      this.actaService.getPorcentajeEscrutinio(dignidad.id).subscribe(data => {
        if (data) {
          this.porcentajes = data;
          this.drawChart();
        }
      }, err => {
        console.log("error:" + err.error.message);
      });
    });
  }


  drawChart() {
    this.basicData = {
      // labels: this.porcentajes.map(row => row.candidato.nombre_papeleta),
      // datasets: [
      //   {
      //     label: 'Votos',
      //     data: this.porcentajes.map(row => row.voto),
      //     backgroundColor: '#9BD0F5'
      //   }
      // ]
      labels: ['Escrutado', 'Fatante'],
      datasets: [
        {
          data: [ parseFloat(this.porcentajes.porcentaje_escrutado).toFixed(2), parseFloat(this.porcentajes.faltante).toFixed(2)],
          backgroundColor: [
            "#07e707",
            "#d4002a"
          ],
          hoverBackgroundColor: [
            "#07e707",
            "#d4002a"
          ]
        }
      ]
    };
  }

}
