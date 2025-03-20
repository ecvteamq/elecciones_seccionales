import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarActaComponent } from './generar-acta.component';

describe('GenerarActaComponent', () => {
  let component: GenerarActaComponent;
  let fixture: ComponentFixture<GenerarActaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerarActaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
