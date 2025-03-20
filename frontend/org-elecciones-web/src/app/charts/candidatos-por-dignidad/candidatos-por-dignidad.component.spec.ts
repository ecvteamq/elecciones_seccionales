import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatosPorDignidadComponent } from './candidatos-por-dignidad.component';

describe('CandidatosPorDignidadComponent', () => {
  let component: CandidatosPorDignidadComponent;
  let fixture: ComponentFixture<CandidatosPorDignidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatosPorDignidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatosPorDignidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
