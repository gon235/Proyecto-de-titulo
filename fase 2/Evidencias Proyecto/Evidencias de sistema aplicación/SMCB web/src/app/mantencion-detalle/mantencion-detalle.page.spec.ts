import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantencionDetallePage } from './mantencion-detalle.page';

describe('MantencionDetallePage', () => {
  let component: MantencionDetallePage;
  let fixture: ComponentFixture<MantencionDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantencionDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
