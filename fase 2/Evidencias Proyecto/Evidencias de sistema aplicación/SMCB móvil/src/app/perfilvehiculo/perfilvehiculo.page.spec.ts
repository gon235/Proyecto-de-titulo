import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilvehiculoPage } from './perfilvehiculo.page';

describe('PerfilvehiculoPage', () => {
  let component: PerfilvehiculoPage;
  let fixture: ComponentFixture<PerfilvehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilvehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
