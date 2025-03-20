import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecintoElectoralComponent } from './recinto-electoral.component';

describe('RecintoElectoralComponent', () => {
  let component: RecintoElectoralComponent;
  let fixture: ComponentFixture<RecintoElectoralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecintoElectoralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecintoElectoralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
