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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Provincia } from 'src/app/models/provincia.model';
import { Canton } from 'src/app/models/canton.model';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { CantonService } from 'src/app/services/canton.service';
import { Validaciones } from 'src/app/utils/validaciones';
import { Valores } from 'src/app/utils/valores';
import { Parroquia } from 'src/app/models/parroquia.model';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { Distrito } from 'src/app/models/distrito.model';
import { DistritoService } from 'src/app/services/distrito.service';
import { parroquiasDeDistritos } from 'src/app/utils/distritos';

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
  public distritos: Distrito[] = [];
  showDetail: boolean = false;
  public displayModal: Boolean;
  editMod: Boolean;
  candidatosReparto: any[];
  partidoReparto: string;
  /** Filtros con los que se obtuvieron los resultados de la tabla (no los que el usuario esté editando). */
  filtrosBusqueda: any = null;
  loadingReparto: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dignidadService: DignidadService,
    private candidatoService: CandidatoService,
    private actaService: ActaService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
    private parroquiaService: ParroquiaService,
    private distritoService: DistritoService
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
    this.candidatosReparto = [];
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
      distrito: [null],
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

  /** Distritos (circunscripciones) del cantón para la dignidad seleccionada. */
  getDistritos() {
    const provincia = this.myForm.get('provincia').value;
    const canton = this.myForm.get('canton').value;
    const dignidad = this.myForm.get('dignidad').value;
    this.myForm.get('distrito').setValue(null);
    if (!provincia || !canton || !dignidad) {
      this.distritos = [];
      return;
    }
    this.distritoService.getByCanton(provincia, canton, dignidad.id).subscribe((data: Distrito[]) => {
      this.distritos = data || [];
      this.changeDistrito();
    }, err => {
      this.distritos = [];
      console.log("error:" + err.error?.message);
    });
  }

  private get distritoSeleccionado(): Distrito {
    return this.distritos.find(d => d.id == this.myForm.get('distrito').value);
  }

  /** Parroquias de los distritos de la dignidad; si hay un distrito seleccionado, solo las de ese distrito. */
  get parroquiasFiltradas(): Parroquia[] {
    return parroquiasDeDistritos(this.parroquias, this.distritos, this.myForm.get('distrito').value);
  }

  changeDistrito() {
    // La parroquia elegida puede no pertenecer al nuevo distrito
    const parroquia = this.myForm.get('parroquia').value;
    if (parroquia && !this.parroquiasFiltradas.some(p => p.codigo == parroquia)) {
      this.myForm.get('parroquia').setValue('');
    }
  }

  getParroquiaByCanton() {
    console.log("get parroquia by canton");
    this.getDistritos();
    this.parroquiaService.getByCantonAndProvincia(this.myForm.get('canton').value, this.myForm.get('provincia').value).subscribe((data: Parroquia[]) => {
      this.parroquias = data;
    }, err => {
      // this.sweetAlert.showMessage('error', 'Hubo un error en el servidor, contacte al administrador', null);
      console.log("error:" + err.error.message);
    });
  }



  /** Descripción de la dignidad seleccionada (vacío si se limpió el dropdown). */
  private get dignidadSeleccionada(): string {
    return this.myForm.get('dignidad').value?.descripcion ?? '';
  }

  /** Dignidades pluripersonales cuyo resultado se reparte entre candidatos (D'Hondt). */
  private requiereReparto(): boolean {
    return Valores.DIGNIDADES_CON_REPARTO.includes(this.dignidadSeleccionada);
  }

  private requiereParroquia(): boolean {
    return this.dignidadSeleccionada == Valores.DIGNIDAD_VOCALES;
  }

  private setRequerido(campo: string, requerido: boolean) {
    const control = this.myForm.get(campo);
    requerido ? control.setValidators([Validators.required]) : control.clearValidators();
    control.updateValueAndValidity();
  }

  changeDignidad() {
    const requiereUbicacion = this.requiereReparto();
    this.setRequerido('provincia', requiereUbicacion);
    this.setRequerido('canton', requiereUbicacion);
    this.setRequerido('parroquia', this.requiereParroquia());
    this.showDetail = requiereUbicacion;
    // Los resultados anteriores son de otra dignidad: tienen otra forma y no admiten reparto
    this.detalles = [];
    this.filtrosBusqueda = null;
    this.getDistritos();
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
    if (!this.dignidadSeleccionada) {
      this.sweetAlert.showMessage('error', 'Debe seleccionar la dignidad');
      return false;
    }
    if (this.requiereReparto()) {
      // Los dropdowns con showClear dejan el valor en null al limpiarse
      if (!this.myForm.get('provincia').value) {
        this.sweetAlert.showMessage('error', 'Debe ingresar la provincia');
        return false;
      }
      if (!this.myForm.get('canton').value) {
        this.sweetAlert.showMessage('error', 'Debe ingresar el cantón');
        return false;
      }
      if (this.requiereParroquia() && !this.myForm.get('parroquia').value) {
        this.sweetAlert.showMessage('error', 'Debe ingresar la parroquia');
        return false;
      }
    }
    return true;
  }

  /** Nombre a mostrar: objeto candidato (unipersonales) o nombre del partido (pluripersonales). */
  nombreResultado(detalle: any): string {
    return detalle?.candidato && typeof detalle.candidato == 'object'
      ? detalle.candidato.nombre_papeleta
      : detalle?.candidato;
  }

  showCandidatosPartidos(detalle) {
    // El reparto se calcula con los mismos filtros con los que se obtuvieron los votos del partido
    const filtros = this.filtrosBusqueda || this.myForm.value;
    let body = {
      "provincia":filtros.provincia,
      "canton":filtros.canton,
      "parroquia":filtros.parroquia,
      "distrito":filtros.distrito,
      "partido":detalle.candidato,
      "votosPartido":detalle.voto,
      "dignidad":filtros.dignidad?.descripcion
    }
    if (!body.provincia || !body.canton) {
      this.sweetAlert.showMessage('error', 'Seleccione la provincia y el cantón y vuelva a buscar');
      return;
    }
    // Evita mostrar los candidatos del partido consultado anteriormente
    this.candidatosReparto = [];
    this.partidoReparto = detalle.candidato;
    this.loadingReparto = true;
    this.actaService.calcularReparto(body).subscribe((data: any[]) => {
      this.candidatosReparto = data || [];
      this.loadingReparto = false;
    }, err => {
      this.loadingReparto = false;
      this.sweetAlert.showMessage('error', err?.error?.message || 'No se pudo calcular el reparto de votos');
    });
    this.displayModal = true;
    this.editMod = true;
  }

  buscarDetalles() {
    if (this.myForm.get('tipo_acta').value != 'ST') {
      if (this.validarReporte()) {
        this.sweetAlert.showMessage('loading');
        const filtros = { ...this.myForm.value };
        this.actaService.getVotos(filtros).subscribe((result: ActaDetalle[]) => {
          this.sweetAlert.showMessage('close');
          this.detalles = result || [];
          this.filtrosBusqueda = filtros;
        }, err => {
          this.sweetAlert.showMessage('error', err?.error?.message || 'No se pudieron obtener los resultados');
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

  /** Filtros aplicados al reporte, para la cabecera del PDF. */
  private filtrosReporte(): string[] {
    const nombre = (lista: any[], codigo: string) => (lista || []).find(item => item.codigo == codigo)?.nombre;
    const busqueda = this.filtrosBusqueda || this.myForm.value;
    const filtros = [`Dignidad: ${busqueda.dignidad?.descripcion ?? ''}`];
    const provincia = nombre(this.provincias, busqueda.provincia);
    const canton = nombre(this.cantones, busqueda.canton);
    const distrito = this.distritos.find(d => d.id == busqueda.distrito);
    const parroquia = nombre(this.parroquias, busqueda.parroquia);
    if (provincia) filtros.push(`Provincia: ${provincia}`);
    if (canton) filtros.push(`Cantón: ${canton}`);
    if (distrito) filtros.push(`Distrito: ${distrito.nombre}`);
    if (parroquia) filtros.push(`Parroquia: ${parroquia}`);
    return filtros;
  }

  private generarPdf(titulo: string, subtitulos: string[], head: string[], body: any[][], archivo: string) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(titulo, 14, 16);
    doc.setFontSize(10);
    subtitulos.forEach((linea, i) => doc.text(linea, 14, 24 + i * 5));
    autoTable(doc, {
      startY: 26 + subtitulos.length * 5,
      head: [head],
      body,
      headStyles: { fillColor: Valores.primaryColor },
      styles: { fontSize: 9 },
    });
    doc.save(`${archivo}_${new Date().getTime()}.pdf`);
  }

  private fechaGeneracion(): string {
    return `Fecha de generación: ${new Date().toLocaleString('es-EC')}`;
  }

  /** Exporta a PDF los resultados mostrados en la tabla del reporte. */
  exportPdf() {
    if (!this.detalles || this.detalles.length == 0) {
      this.sweetAlert.showMessage('error', 'No hay resultados para exportar');
      return;
    }
    const unipersonal = (this.filtrosBusqueda || this.myForm.value).dignidad?.tipo == 'UNIPERSONAL';
    const body: any[][] = this.detalles.map((detalle: any, i) => [
      i + 1,
      this.nombreResultado(detalle),
      detalle.lista,
      Number(detalle.voto).toLocaleString('es-EC')
    ]);
    const total = this.detalles.reduce((suma, detalle: any) => suma + Number(detalle.voto || 0), 0);
    body.push(['', 'TOTAL', '', total.toLocaleString('es-EC')]);
    this.generarPdf('Reporte de resultados', [...this.filtrosReporte(), this.fechaGeneracion()],
      ['#', unipersonal ? 'Candidato' : 'Partido', 'Lista', 'Votos'], body, 'reporte_resultados');
  }

  /** Exporta a PDF el reparto de votos entre los candidatos del partido consultado. */
  exportPdfReparto() {
    if (!this.candidatosReparto || this.candidatosReparto.length == 0) {
      this.sweetAlert.showMessage('error', 'No hay candidatos para exportar');
      return;
    }
    const body = this.candidatosReparto.map((candidato, i) => [i + 1, candidato.nombre, candidato.lista, candidato.voto]);
    this.generarPdf('Reparto de votos por candidato',
      [...this.filtrosReporte(), `Partido: ${this.partidoReparto}`, this.fechaGeneracion()],
      ['#', 'Candidato', 'Lista', 'Votos'], body, 'reparto_candidatos');
  }

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
