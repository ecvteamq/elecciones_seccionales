import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatosPorDignidadComponent } from '../charts/candidatos-por-dignidad/candidatos-por-dignidad.component';
import { PorcentajeEscrutinioComponent } from '../charts/porcentaje-escrutinio/porcentaje-escrutinio.component';
import { Canton } from '../models/canton.model';
import { Dignidad } from '../models/dignidad.model';
import { Parroquia } from '../models/parroquia.model';
import { Provincia } from '../models/provincia.model';
import { Usuario } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';
import { CantonService } from '../services/canton.service';
import { DignidadService } from '../services/dignidad.service';
import { ParroquiaService } from '../services/parroquia.service';
import { ProvinciaService } from '../services/provincia.service';
import { Valores } from '../utils/valores';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user: Usuario;
  showDashboard: boolean;
  dignidades: Dignidad[];
  myForm: FormGroup;
  dignidad: string;
  @ViewChild(CandidatosPorDignidadComponent) candidatos: CandidatosPorDignidadComponent;
  @ViewChild(PorcentajeEscrutinioComponent) porcentajes: PorcentajeEscrutinioComponent;
  public provincias: Provincia[];
  public provincia: string;
  public cantones: Canton[];
  public canton: string;
  public parroquias: Parroquia[];
  public parroquia: string;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dignidadService: DignidadService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService
  ) {
    this.user = this.authService.usuarioSession;
    this.user.roles.forEach(rol => {
      switch (rol.nombre) {
        case Valores.USUARIO_ADMINISTRADOR:
          this.showDashboard = true;
          break;

        case Valores.USUARIO_OPERATIVO:
          this.showDashboard = false;
          break;

        case Valores.USUARIO_GERENCIAL:
          this.showDashboard = true;
          break;

        default:
          break;
      }

    });
    this.dignidad = 'ALCALDES MUNICIPALES';
    this.provincia = Valores.COGIGO_IMBABURA;
    this.getCantones();
    this.canton = '1001';
    this.getParroquiaByCanton();
  }

  ngOnInit(): void {
    this.getDignidades();
    this.getProvincias();
  }

  getProvincias() {
    this.provinciaService.getAll().subscribe((data: Provincia[]) => {
      this.provincias = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  getCantones() {

    this.cantonService.getByProvincia(this.provincia).subscribe((data: Canton[]) => {
      this.cantones = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  getParroquiaByCanton() {
    console.log("get parroquia by canton");
    this.parroquiaService.getByCantonAndProvincia(this.canton, this.provincia).subscribe((data: Parroquia[]) => {
      this.parroquias = data;
    }, err => {
      // this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
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

  onChangeDignidad() {
    this.candidatos.buscarDetalles(this.dignidad,this.provincia,this.canton,this.parroquia);
    this.porcentajes.getPorcentajes(this.dignidad);
  }

}
