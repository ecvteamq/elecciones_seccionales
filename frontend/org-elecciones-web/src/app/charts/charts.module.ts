import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatosPorDignidadComponent } from './candidatos-por-dignidad/candidatos-por-dignidad.component';
import { ChartModule } from 'angular2-chartjs';
import { DemoFlexyModule } from '../demo-flexy-module';
import { SharedModule } from '../pages/shared/shared.module';
import { PorcentajeEscrutinioComponent } from './porcentaje-escrutinio/porcentaje-escrutinio.component';



@NgModule({
  declarations: [
    CandidatosPorDignidadComponent,
    PorcentajeEscrutinioComponent,
  ],
  imports: [
    CommonModule,
    ChartModule,
    DemoFlexyModule,
    SharedModule
  ], exports: [
    CandidatosPorDignidadComponent,
    PorcentajeEscrutinioComponent
  ]
})
export class ChartsModule { }
