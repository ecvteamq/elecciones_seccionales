import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorcentajeEscrutinioComponent } from './porcentaje-escrutinio.component';

describe('PorcentajeEscrutinioComponent', () => {
  let component: PorcentajeEscrutinioComponent;
  let fixture: ComponentFixture<PorcentajeEscrutinioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PorcentajeEscrutinioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorcentajeEscrutinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
