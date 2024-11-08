import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantencionesPage } from './mantenciones.page';

describe('MantencionesPage', () => {
  let component: MantencionesPage;
  let fixture: ComponentFixture<MantencionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantencionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
