import { Component, ViewChild } from '@angular/core';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexFill,
  ApexXAxis,
  ApexGrid
} from 'ng-apexcharts';


export interface activeusercardChartOptions {
  series: ApexAxisChartSeries;
  dataLabels: ApexDataLabels;
  chart: ApexChart;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
}


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],

})
export class SalesComponent {

  @ViewChild("activeusercardchart") chart1: ChartComponent = Object.create(null);
  public activeusercardChartOptions !: Partial<activeusercardChartOptions> | any;

  constructor() {
    // active users
    this.activeusercardChartOptions = {
      series: [{
        name:'Votos',
        colors:["#00E396","#03c9d7","#fb9678"],
        data: [{
          x: 'Alfredo Palacios',
          y: 10,
        }, {
          x: 'Edwin Castro',
          y: 18
        }, {
          x: 'Ruales',
          y: 13,
        }]
      }],
      // colors: ['#00E396'],
      chart: {
        toolbar: {
          show: false,
        },
        type: 'bar',
        height: 300,

      },
      legend: {
        show: false,
      },

      tooltip: {
        theme: "dark"
      },

      grid: {
        show: false,
      },

      dataLabels: {
        enabled: false,
      },

      stroke: {
        show: true,
        width: 5,
        colors: ['none']
      },

      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 6,
        },
      },
    }
  }


}
