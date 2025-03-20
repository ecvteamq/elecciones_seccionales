import { Component, OnInit } from '@angular/core';
import { ActaService } from 'src/app/services/acta.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';

@Component({
  selector: 'app-procesos',
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.scss']
})
export class ProcesosComponent implements OnInit {
  public sweetAlert: SweetalertConfig;


  constructor(
    private actaService: ActaService,
    private usuarioService: UsuarioService
  ) {
    this.sweetAlert = new SweetalertConfig();
  }

  ngOnInit(): void {
  }

  encerarVotaciones() {
    this.sweetAlert.confirm('La información registrada se eliminara, esta acción no se puede revertir').then(resp => {
      this.sweetAlert.showMessage('loading');
      this.actaService.delete().subscribe(res => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success');
      });
    }, err => {
      console.log("cancelado");
    });
  }

  aprobarTodosUsuarios() {
    this.sweetAlert.confirm('Todos los usuarios inactivos se activarán, esta acción no se puede revertir').then(resp => {
      this.sweetAlert.showMessage('loading');
      this.usuarioService.activateAllUser().subscribe(res => {
        this.sweetAlert.showMessage('close');
        this.sweetAlert.showMessage('success');
      });
    }, err => {
      console.log("cancelado");
    });
  }
}
