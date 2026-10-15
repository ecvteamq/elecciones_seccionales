import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { RecintoElectoral } from 'src/app/models/recinto_electoral.model';
import { RecintoElectoralService } from 'src/app/services/recinto_electoral.service';
import { RecintoElectoralComponent } from './recinto-electoral.component';

const recintosBackend = [
  {
    id: 19, codigo: '1440', nombre: 'UE Atahualpa', direccion: 'Río Tiputini 6-63', estado: 'ACTIVO',
    parroquia: { id: 607, codigo: '100101', nombre: 'CARANQUI' },
    canton: { id: 100, codigo: '1001', nombre: 'IBARRA' },
    provincia: { id: 10, codigo: '10', nombre: 'IMBABURA' },
    total_juntas: 13, numero_electores: 4550,
    nombre_recinto: 'UE Atahualpa', direccion_recinto: 'Río Tiputini 6-63',
    nombre_parroquia: 'CARANQUI', nombre_canton: 'IBARRA', nombre_provincia: 'IMBABURA',
    junta_femenino: 7, junta_masculino: 6,
  },
] as RecintoElectoral[];

describe('RecintoElectoralComponent', () => {
  let component: RecintoElectoralComponent;
  let fixture: ComponentFixture<RecintoElectoralComponent>;
  let recintoService: jasmine.SpyObj<RecintoElectoralService>;

  beforeEach(async () => {
    recintoService = jasmine.createSpyObj<RecintoElectoralService>('RecintoElectoralService', ['getAll']);
    recintoService.getAll.and.returnValue(of(recintosBackend));

    await TestBed.configureTestingModule({
      declarations: [RecintoElectoralComponent],
      imports: [ReactiveFormsModule],
      providers: [
        ConfirmationService,
        { provide: RecintoElectoralService, useValue: recintoService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RecintoElectoralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga los recintos del backend al iniciar', () => {
    expect(recintoService.getAll).toHaveBeenCalledTimes(1);
    expect(component.recintos.length).toBe(1);
    expect(component.loadingTable).toBeFalse();
  });

  it('recibe los campos que muestra la tabla', () => {
    const recinto = component.recintos[0];
    expect(recinto.nombre_recinto).toBe('UE Atahualpa');
    expect(recinto.direccion_recinto).toBe('Río Tiputini 6-63');
    expect(recinto.nombre_provincia).toBe('IMBABURA');
    expect(recinto.nombre_canton).toBe('IBARRA');
    expect(recinto.nombre_parroquia).toBe('CARANQUI');
    expect(recinto.estado).toBe('ACTIVO');
  });

  it('quita el indicador de carga si el backend falla', () => {
    recintoService.getAll.and.returnValue(throwError(() => new Error('500')));
    component.onCallRecintos();
    expect(component.loadingTable).toBeFalse();
  });
});
