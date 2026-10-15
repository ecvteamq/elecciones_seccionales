import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ReportesComponent } from './reportes.component';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { ActaService } from 'src/app/services/acta.service';
import { CandidatoService } from 'src/app/services/candidato.service';
import { CantonService } from 'src/app/services/canton.service';
import { DignidadService } from 'src/app/services/dignidad.service';
import { DistritoService } from 'src/app/services/distrito.service';
import { ParroquiaService } from 'src/app/services/parroquia.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { Valores } from 'src/app/utils/valores';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let actaService: jasmine.SpyObj<ActaService>;
  let showMessage: jasmine.Spy;
  let distritoService: jasmine.SpyObj<DistritoService>;

  const dignidad = (descripcion: string, tipo = 'PLURIPERSONAL') => ({ id: '1', descripcion, tipo, estado: 'ACTIVO' });

  beforeEach(async () => {
    actaService = jasmine.createSpyObj<ActaService>('ActaService',
      ['calcularReparto', 'metodoWebster', 'getVotos', 'getActaTotalByFilters', 'getAll']);
    distritoService = jasmine.createSpyObj<DistritoService>('DistritoService', ['getByCanton']);
    distritoService.getByCanton.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ReportesComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule, SharedModule],
      providers: [
        { provide: ActaService, useValue: actaService },
        { provide: DignidadService, useValue: { getAll: () => of([]) } },
        { provide: CandidatoService, useValue: { getListas: () => of([]) } },
        { provide: ProvinciaService, useValue: { getAll: () => of([]) } },
        { provide: CantonService, useValue: { getByProvincia: () => of([]) } },
        { provide: ParroquiaService, useValue: { getByCantonAndProvincia: () => of([]) } },
        { provide: DistritoService, useValue: distritoService },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    showMessage = spyOn(component.sweetAlert, 'showMessage');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeDignidad', () => {
    it('exige provincia y cantón y muestra el detalle para concejales', () => {
      for (const descripcion of [Valores.DIGNIDAD_CONCEJALES_URBANOS, Valores.DIGNIDAD_CONCEJALES_RURALES, Valores.DIGNIDAD_CPCCS]) {
        component.myForm.get('dignidad').setValue(dignidad(descripcion));
        component.changeDignidad();

        expect(component.showDetail).withContext(descripcion).toBeTrue();
        expect(component.myForm.get('provincia').hasError('required')).withContext(descripcion).toBeTrue();
        expect(component.myForm.get('canton').hasError('required')).withContext(descripcion).toBeTrue();
        expect(component.myForm.get('parroquia').hasError('required')).withContext(descripcion).toBeFalse();
      }
    });

    it('exige además la parroquia para vocales', () => {
      component.myForm.get('dignidad').setValue(dignidad(Valores.DIGNIDAD_VOCALES));
      component.changeDignidad();

      expect(component.showDetail).toBeTrue();
      expect(component.myForm.get('parroquia').hasError('required')).toBeTrue();
    });

    it('quita la parroquia obligatoria al pasar de vocales a concejales', () => {
      component.myForm.get('dignidad').setValue(dignidad(Valores.DIGNIDAD_VOCALES));
      component.changeDignidad();
      component.myForm.get('dignidad').setValue(dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS));
      component.changeDignidad();

      expect(component.myForm.get('parroquia').hasError('required')).toBeFalse();
    });

    it('no muestra el detalle para dignidades unipersonales', () => {
      component.myForm.get('dignidad').setValue(dignidad(Valores.DIGNIDAD_ALCALDE, 'UNIPERSONAL'));
      component.changeDignidad();

      expect(component.showDetail).toBeFalse();
      expect(component.myForm.get('provincia').valid).toBeTrue();
    });

    it('no falla cuando se limpia la dignidad', () => {
      component.myForm.get('dignidad').setValue(null);
      expect(() => component.changeDignidad()).not.toThrow();
      expect(component.showDetail).toBeFalse();
    });
  });

  describe('validarReporte', () => {
    it('falla si no hay dignidad', () => {
      component.myForm.get('dignidad').setValue(null);
      expect(component.validarReporte()).toBeFalse();
      expect(showMessage).toHaveBeenCalledWith('error', 'Debe seleccionar la dignidad');
    });

    it('pide el cantón para concejales aunque el dropdown haya quedado en null', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_CONCEJALES_RURALES), provincia: '10', canton: null });
      expect(component.validarReporte()).toBeFalse();
      expect(showMessage).toHaveBeenCalledWith('error', 'Debe ingresar el cantón');
    });

    it('pide la parroquia para vocales', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_VOCALES), provincia: '10', canton: '1001', parroquia: '' });
      expect(component.validarReporte()).toBeFalse();
      expect(showMessage).toHaveBeenCalledWith('error', 'Debe ingresar la parroquia');
    });

    it('es válido con todos los datos', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_VOCALES), provincia: '10', canton: '1001', parroquia: '100150' });
      expect(component.validarReporte()).toBeTrue();
    });

    it('es válido para alcaldes sin ubicación', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_ALCALDE, 'UNIPERSONAL') });
      expect(component.validarReporte()).toBeTrue();
    });
  });

  describe('showCandidatosPartidos', () => {
    const detalle = { candidato: 'PARTIDO X', voto: 900, lista: '5' };

    beforeEach(() => {
      component.myForm.patchValue({
        dignidad: dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS), provincia: '10', canton: '1001', parroquia: ''
      });
    });

    it("usa el método de reparto activo (D'Hondt) y no el de Webster", () => {
      const candidatos = [{ nombre: 'A', lista: 5, voto: '900.00' }, { nombre: 'B', lista: 5, voto: '450.00' }];
      actaService.calcularReparto.and.returnValue(of(candidatos));

      component.showCandidatosPartidos(detalle);

      expect(actaService.calcularReparto).toHaveBeenCalledWith({
        provincia: '10', canton: '1001', parroquia: '', distrito: null, partido: 'PARTIDO X',
        votosPartido: 900, dignidad: Valores.DIGNIDAD_CONCEJALES_URBANOS
      });
      expect(actaService.metodoWebster).not.toHaveBeenCalled();
      expect(component.candidatosReparto).toEqual(candidatos);
      expect(component.loadingReparto).toBeFalse();
      expect(component.displayModal).toBeTrue();
    });

    it('limpia los candidatos del partido anterior y muestra el error si falla', () => {
      component.candidatosReparto = [{ nombre: 'anterior' }];
      actaService.calcularReparto.and.returnValue(throwError(() => ({ error: { message: 'Provincia o cantón no encontrados' } })));

      component.showCandidatosPartidos(detalle);

      expect(component.candidatosReparto).toEqual([]);
      expect(component.loadingReparto).toBeFalse();
      expect(showMessage).toHaveBeenCalledWith('error', 'Provincia o cantón no encontrados');
    });
  });

  describe('buscarDetalles', () => {
    it('cierra el loader y muestra el error si falla la consulta', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_ALCALDE, 'UNIPERSONAL') });
      actaService.getVotos.and.returnValue(throwError(() => ({ error: {} })));

      component.buscarDetalles();

      expect(showMessage).toHaveBeenCalledWith('loading');
      expect(showMessage).toHaveBeenCalledWith('error', 'No se pudieron obtener los resultados');
    });

    it('carga los detalles', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_ALCALDE, 'UNIPERSONAL') });
      const detalles: any[] = [{ lista: '5', voto: 10, candidato: { nombre_papeleta: 'X' } }];
      actaService.getVotos.and.returnValue(of(detalles));

      component.buscarDetalles();

      expect(component.detalles).toEqual(detalles);
      expect(showMessage).toHaveBeenCalledWith('close');
    });
  });

  describe('distritos', () => {
    const distritos: any[] = [
      { id: 1, nombre: 'CIRCUNSCRIPCIÓN 1', parroquias: [{ codigo: '100103' }, { codigo: '100102' }] },
      { id: 2, nombre: 'CIRCUNSCRIPCIÓN 2', parroquias: [{ codigo: '100101' }] },
    ];

    beforeEach(() => {
      distritoService.getByCanton.and.returnValue(of(distritos));
      component.parroquias = [
        { codigo: '100101', nombre: 'CARANQUI' }, { codigo: '100102', nombre: 'ALPACHACA' }, { codigo: '100103', nombre: 'SAGRARIO' }
      ] as any[];
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS), provincia: '10', canton: '1001' });
    });

    it('carga los distritos del cantón para la dignidad seleccionada', () => {
      component.getDistritos();
      expect(distritoService.getByCanton).toHaveBeenCalledWith('10', '1001', '1');
      expect(component.distritos).toEqual(distritos);
    });

    it('no consulta distritos sin cantón', () => {
      component.myForm.patchValue({ canton: null });
      component.getDistritos();
      expect(distritoService.getByCanton).not.toHaveBeenCalled();
      expect(component.distritos).toEqual([]);
    });

    it('filtra las parroquias del distrito y limpia la parroquia que no pertenece', () => {
      component.getDistritos();
      component.myForm.patchValue({ parroquia: '100101', distrito: 1 });
      component.changeDistrito();

      expect(component.parroquiasFiltradas.map(p => p.codigo)).toEqual(['100102', '100103']);
      expect(component.myForm.get('parroquia').value).toBe('');
    });

    it('envía el distrito al calcular el reparto', () => {
      actaService.calcularReparto.and.returnValue(of([]));
      component.getDistritos();
      component.myForm.patchValue({ distrito: 2 });
      component.showCandidatosPartidos({ candidato: 'PARTIDO X', voto: 10 });
      expect(actaService.calcularReparto.calls.mostRecent().args[0].distrito).toBe(2);
    });
  });

  describe('exportPdf', () => {
    it('avisa si no hay resultados para exportar', () => {
      component.detalles = [];
      component.exportPdf();
      expect(showMessage).toHaveBeenCalledWith('error', 'No hay resultados para exportar');
    });
  });

  describe('resultados de una búsqueda anterior', () => {
    it('limpia la tabla al cambiar de dignidad', () => {
      component.detalles = [{ candidato: { nombre_papeleta: 'X' }, lista: '5', voto: 10 }] as any[];
      component.myForm.get('dignidad').setValue(dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS));
      component.changeDignidad();
      expect(component.detalles).toEqual([]);
    });

    it('muestra el nombre del candidato o del partido según la forma del resultado', () => {
      expect(component.nombreResultado({ candidato: { nombre_papeleta: 'JUAN' } })).toBe('JUAN');
      expect(component.nombreResultado({ candidato: 'PARTIDO X' })).toBe('PARTIDO X');
    });

    it('el reparto usa los filtros de la búsqueda aunque luego se limpie el formulario', () => {
      const filtros = { dignidad: dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS), provincia: '10', canton: '1001', parroquia: '', distrito: 2 };
      component.myForm.patchValue(filtros);
      actaService.getVotos.and.returnValue(of([{ candidato: 'PARTIDO X', lista: '5', voto: 900 }] as any[]));
      actaService.calcularReparto.and.returnValue(of([]));
      component.buscarDetalles();

      component.myForm.patchValue({ provincia: null, canton: null, distrito: null });
      component.showCandidatosPartidos({ candidato: 'PARTIDO X', voto: 900 });

      const body = actaService.calcularReparto.calls.mostRecent().args[0];
      expect(body.provincia).toBe('10');
      expect(body.canton).toBe('1001');
      expect(body.distrito).toBe(2);
    });

    it('no llama al reparto sin provincia ni cantón', () => {
      component.myForm.patchValue({ dignidad: dignidad(Valores.DIGNIDAD_CONCEJALES_URBANOS), provincia: null, canton: null });
      component.showCandidatosPartidos({ candidato: 'PARTIDO X', voto: 900 });
      expect(actaService.calcularReparto).not.toHaveBeenCalled();
      expect(showMessage).toHaveBeenCalledWith('error', 'Seleccione la provincia y el cantón y vuelva a buscar');
    });
  });
});
