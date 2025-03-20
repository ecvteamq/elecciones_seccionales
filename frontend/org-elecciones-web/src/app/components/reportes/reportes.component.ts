import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Acta } from 'src/app/models/acta.model';
import { ActaDetalle } from 'src/app/models/acta_detalle.model';
import { Candidato } from 'src/app/models/candidato.model';
import { Dignidad } from 'src/app/models/dignidad.model';
import { ActaService } from 'src/app/services/acta.service';
import { CandidatoService } from 'src/app/services/candidato.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { SweetalertConfig } from 'src/app/utils/sweet-alert-config';
import FileSaver from 'file-saver';
// import * as jsPDF from 'jspdf'; 
// import * as autoTable from 'jspdf-autotable';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { UserOptions } from 'jspdf-autotable';

// interface jsPDFCustom extends jsPDF {
//   autoTable: (options: UserOptions) => void;
// }

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import { Provincia } from 'src/app/models/provincia.model';
import { Canton } from 'src/app/models/canton.model';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { CantonService } from 'src/app/services/canton.service';
import { Validaciones } from 'src/app/utils/validaciones';
import { Valores } from 'src/app/utils/valores';
import { Parroquia } from 'src/app/models/parroquia.model';
import { ParroquiaService } from 'src/app/services/parroquia.service';

interface jsPDFCustom extends jsPDF {
  autoTable: (options: UserOptions) => void;
}

const doc = new jsPDF() as jsPDFCustom;


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  public dignidades: Dignidad[];
  public provincias: Provincia[];
  public cantones: Canton[];
  myForm: FormGroup;
  actas: Acta[];
  loadingTable: boolean;
  listas: Candidato[];
  detalles: ActaDetalle[];
  totales: Acta[];
  public sweetAlert: SweetalertConfig;
  cols: any[];
  exportColumns: any[];
  public vl: Validaciones;
  public parroquias: Parroquia[];
  showDetail: boolean = false;
  public displayModal: Boolean;
  editMod: Boolean;
  candidatosWebster:any[];

  constructor(
    private formBuilder: FormBuilder,
    private dignidadService: DignidadService,
    private candidatoService: CandidatoService,
    private actaService: ActaService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService
  ) {
    this.actas = [];
    this.detalles = [];
    this.sweetAlert = new SweetalertConfig();
    this.vl = new Validaciones();
    this.cols = [
      { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
      { field: 'name', header: 'Name' },
      { field: 'category', header: 'Category' },
      { field: 'quantity', header: 'Quantity' }
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    this.candidatosWebster = [];
  }

  ngOnInit(): void {
    this.buildForm();
    this.getDignidades();
    this.getListas();
    // this.getActas();
    this.getProvincias();
  }

  private buildForm() {
    this.myForm = this.formBuilder.group({
      dignidad: ['', [Validators.required]],
      lista: [''],
      numero_acta: [''],
      tipo_acta: [''],
      provincia: [''],
      canton: [''],
      parroquia: ['']
    });
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
    this.parroquiaService.getByCantonAndProvincia(this.myForm.get('canton').value, this.myForm.get('provincia').value).subscribe((data: Parroquia[]) => {
      this.parroquias = data;
    }, err => {
      // this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
      console.log("error:" + err.error.message);
    });
  }



  changeDignidad() {
    console.log("dignidad:", this.myForm.get('dignidad').value.descripcion);
    if (this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_ALCALDE || this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_PREFECTO) {
      this.myForm.get('canton').clearValidators();
      this.myForm.get('provincia').clearValidators();
      this.myForm.get('parroquia').clearValidators();
      this.showDetail = false;
    } else if (this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_CONCEJALES_RURALES || this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_CONCEJALES_URBANOS) {
      this.myForm.get('canton').setValidators([Validators.required]);
      this.myForm.get('provincia').setValidators([Validators.required]);
      this.myForm.invalid;
      this.showDetail = true;
    } else if (this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_VOCALES) {
      this.myForm.get('canton').setValidators([Validators.required]);
      this.myForm.get('provincia').setValidators([Validators.required]);
      this.myForm.get('parroquia').setValidators([Validators.required]);
      this.myForm.invalid;
      this.showDetail = true;
    }
  }

  changeTipoActa() {
    if (this.myForm.get('tipo_acta').value == 'ST') {
      this.myForm.get('lista').clearValidators();
      this.myForm.get('canton').setValidators([Validators.required]);
      this.myForm.get('provincia').setValidators([Validators.required]);
    } else {
      this.myForm.get('lista').setValidators([Validators.required]);
      this.myForm.get('canton').clearValidators();
      this.myForm.get('provincia').clearValidators();
    }

  }

  getActas() {
    this.actaService.getAll().subscribe((data: Acta[]) => {
      this.actas = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  getTotalesByCanton() {
    this.sweetAlert.showMessage('loading');
    let body = {
      "dignidad": this.myForm.get('dignidad').value,
      "provincia": this.myForm.get('provincia').value,
      "canton": this.myForm.get('canton').value
    }
    console.log("form:", this.myForm.value);
    this.actaService.getActaTotalByFilters(body).subscribe((result: Acta[]) => {
      console.log("result reporte:", result);
      if (result) {
        this.sweetAlert.showMessage('close');
        this.totales = result;
      }
    }, err => {
      this.sweetAlert.showMessage('close');
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

  getListas() {
    this.candidatoService.getListas().subscribe((data: Candidato[]) => {
      this.listas = data;
    }, err => {
      console.log("error:" + err.error.message);
    });
  }

  validarReporte(): boolean {
    if (this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_CONCEJALES_RURALES || this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_CONCEJALES_URBANOS) {
      if (this.myForm.get('provincia').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar la provincia');
        return false;
      }
      if (this.myForm.get('canton').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar el cantón');
        return false;
      }
    } else if (this.myForm.get('dignidad').value.descripcion == Valores.DIGNIDAD_VOCALES) {
      if (this.myForm.get('provincia').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar la provincia');
        return false;
      }
      if (this.myForm.get('canton').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar el cantón');
        return false;
      }
      if (this.myForm.get('parroquia').value == '') {
        this.sweetAlert.showMessage('error', 'Debe ingresar la parroquia');
        return false;
      }
    }
    return true;
  }

  showCandidatosPartidos(detalle) {
    console.log("detalle:",detalle);
    let body = {
      "provincia":this.myForm.get('provincia').value,
      "canton":this.myForm.get('canton').value,
      "parroquia":this.myForm.get('parroquia').value,
      "partido":detalle.candidato,
      "votosPartido":detalle.voto,
      "dignidad":this.myForm.get('dignidad').value.descripcion
    }
    this.actaService.metodoWebster(body).subscribe((data:any[])=>{
      if(data){
        console.log("data webster:",data);
        this.candidatosWebster = data;
      }
    });
    this.displayModal = true;
    this.editMod = true;
  }

  buscarDetalles() {
    if (this.myForm.get('tipo_acta').value != 'ST') {
      if (this.validarReporte()) {
        this.sweetAlert.showMessage('loading');
        this.actaService.getVotos(this.myForm.value).subscribe((result: ActaDetalle[]) => {
          console.log("result reporte:", result);
          if (result) {
            this.sweetAlert.showMessage('close');
            this.detalles = result;
          }
        }, err => {
          console.log("error:" + err.error.message);
        });
      }
    } else {
      this.getTotalesByCanton();
    }

  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.detalles);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array"
      });
      this.saveAsExcelFile(excelBuffer, "resultados");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    // import("file-saver").then(FileSaver => {

    // });

    let EXCEL_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    let EXCEL_EXTENSION = ".xlsx";
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(
      data,
      fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  // exportPdf() {
  //   // import("jspdf").then(jsPDF => {
  //   //     import("jspdf-autotable").then(x => {
  //   //         const doc = new jsPDF.default(0,0);
  //   //         doc.autoTable(this.exportColumns, this.products);
  //   //         doc.save('products.pdf');
  //   //     })
  //   // })
  //   doc.autoTable(this.exportColumns, this.detalles);
  //   doc.save('products.pdf');
  //   doc.autoTable({
  //     columns:this.exportColumns,
  //     body:[
  //       this.detalles
  //     ]
  //   });
  //   doc.save("table.pdf");
  // }

  validErrorForm(campo) {
    return this.vl.validErrorForm(campo, this.myForm);
  }

  validTypeMsgForm(nombre, campo) {
    return this.vl.validTypeMsgForm(nombre, campo, this.myForm);
  }

  onHide() {
    this.displayModal = false;
    this.editMod = false;
  }

  limpiarForm() {
    this.displayModal = false;
    this.editMod = false;
  }

}
