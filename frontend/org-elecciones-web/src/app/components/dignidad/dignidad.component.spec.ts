import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DignidadComponent } from './dignidad.component';

describe('DignidadComponent', () => {
  let component: DignidadComponent;
  let fixture: ComponentFixture<DignidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DignidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DignidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
