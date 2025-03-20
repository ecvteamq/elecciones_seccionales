import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { Valores } from 'src/app/utils/valores';

interface sidebarMenu {
  link: string;
  icon: string;
  menu: string;
}

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent {

  search: boolean = false;
  user: Usuario;
  sidebarMenu: sidebarMenu[] = [
    {
      link: "pages/home",
      icon: "home",
      menu: "Inicio",
    },
    {
      link: "procesos",
      icon: "play",
      menu: "Procesos",
    },
    {
      link: "usuarios",
      icon: "user",
      menu: "Usuarios",
    },
    {
      link: "recinto-electoral",
      icon: "map-pin",
      menu: "Recinto Electoral",
    },
    {
      link: "dignidad",
      icon: "bar-chart-2",
      menu: "Dignidades",
    },

    {
      link: "reportes",
      icon: "printer",
      menu: "Reportes",
    },
    {
      link: "candidato",
      icon: "users",
      menu: "Candidatos",
    },
    {
      link: "actas-registradas",
      icon: "book-open",
      menu: "Actas registradas",
    },
    {
      link: "generar-acta",
      icon: "check",
      menu: "Generación de actas",
    },

    // {
    //   link: "forms",
    //   icon: "layout",
    //   menu: "Forms",
    // },
    // {
    //   link: "alerts",
    //   icon: "info",
    //   menu: "Alerts",
    // },
    // {
    //   link: "grid-list",
    //   icon: "file-text",
    //   menu: "Grid List",
    // },
    // {
    //   link: "menu",
    //   icon: "menu",
    //   menu: "Menus",
    // },
    // {
    //   link: "table",
    //   icon: "grid",
    //   menu: "Tables",
    // },
    // {
    //   link: "expansion",
    //   icon: "divide-circle",
    //   menu: "Expansion Panel",
    // },
    // {
    //   link: "chips",
    //   icon: "award",
    //   menu: "Chips",
    // },
    // {
    //   link: "tabs",
    //   icon: "list",
    //   menu: "Tabs",
    // },
    // {
    //   link: "progress",
    //   icon: "bar-chart-2",
    //   menu: "Progress Bar",
    // },
    // {
    //   link: "toolbar",
    //   icon: "voicemail",
    //   menu: "Toolbar",
    // },
    // {
    //   link: "progress-snipper",
    //   icon: "loader",
    //   menu: "Progress Snipper",
    // },
    // {
    //   link: "tooltip",
    //   icon: "bell",
    //   menu: "Tooltip",
    // },
    // {
    //   link: "snackbar",
    //   icon: "slack",
    //   menu: "Snackbar",
    // },
    // {
    //   link: "slider",
    //   icon: "sliders",
    //   menu: "Slider",
    // },
    // {
    //   link: "slide-toggle",
    //   icon: "layers",
    //   menu: "Slide Toggle",
    // },


  ]

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService) {
    this.user = this.authService.usuarioSession;
    this.user.roles.forEach(rol => {
      // console.log(rol.nombre);
      if (rol.nombre != Valores.USUARIO_ADMINISTRADOR) {
        if (rol.nombre == Valores.USUARIO_OPERATIVO) {
          // console.log("entro");
          this.sidebarMenu.splice(0, 8);
          // this.sidebarMenu.splice(6, 6);
        } else if (rol.nombre = Valores.USUARIO_GERENCIAL) {
          this.sidebarMenu.splice(0, 5);
          // this.sidebarMenu.splice(5,6);
        }
      }

    });
    console.log(this.sidebarMenu.length);
  }

  routerActive: string = "activelink";



  cerrarSesion() {
    this.authService.cerrarSesion();
  }

}
