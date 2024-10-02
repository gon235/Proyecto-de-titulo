import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearmantencionPage } from './crearmantencion.page';

describe('CrearmantencionPage', () => {
  let component: CrearmantencionPage;
  let fixture: ComponentFixture<CrearmantencionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearmantencionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
