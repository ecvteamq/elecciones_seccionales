import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts/alerts.component';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FormsComponent } from './forms/forms.component';
import { DemoFlexyModule } from '../demo-flexy-module';
import { GridListComponent } from './grid-list/grid-list.component';
import { MenuComponent } from './menu/menu.component';
import { TabsComponent } from './tabs/tabs.component';
import { ExpansionComponent } from './expansion/expansion.component';
import { ChipsComponent } from './chips/chips.component';
import { ProgressComponent } from './progress/progress.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ProgressSnipperComponent } from './progress-snipper/progress-snipper.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { SliderComponent } from './slider/slider.component';
import { SlideToggleComponent } from './slide-toggle/slide-toggle.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { GenerarActaComponent } from './generar-acta/generar-acta.component'
import { SharedModule } from '../pages/shared/shared.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ConfirmationService } from 'primeng/api';
import { RecintoElectoralComponent } from './recinto-electoral/recinto-electoral.component';
import { ReportesComponent } from './reportes/reportes.component';
import { DignidadComponent } from './dignidad/dignidad.component';
import { ProcesosComponent } from './procesos/procesos.component';
import { CandidatosComponent } from './candidatos/candidatos.component';
import { ActasRegistradasComponent } from './actas-registradas/actas-registradas.component';

@NgModule({
  declarations: [
    AlertsComponent,
    FormsComponent,
    GridListComponent,
    MenuComponent,
    TabsComponent,
    ExpansionComponent,
    ChipsComponent,
    ProgressComponent,
    ToolbarComponent,
    ProgressSnipperComponent,
    SnackbarComponent,
    SliderComponent,
    SlideToggleComponent,
    ButtonsComponent,
    TooltipsComponent,
    GenerarActaComponent,
    UsuariosComponent,
    RecintoElectoralComponent,
    ReportesComponent,
    DignidadComponent,
    ProcesosComponent,
    CandidatosComponent,
    ActasRegistradasComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(allIcons),
    DemoFlexyModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  exports: [
    AlertsComponent,
    FormsComponent,
    GridListComponent,
    MenuComponent,
    TabsComponent,
    ExpansionComponent,
    ChipsComponent,
    ProgressComponent,
    ToolbarComponent,
    ProgressSnipperComponent,
    SnackbarComponent,
    SliderComponent,
    SlideToggleComponent,
    ButtonsComponent,
  ],
  providers:[
    ConfirmationService
  ]
})
export class ComponentsModule { }
