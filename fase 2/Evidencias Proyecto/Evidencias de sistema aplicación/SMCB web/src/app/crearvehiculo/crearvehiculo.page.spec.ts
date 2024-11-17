import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearvehiculoPage } from './crearvehiculo.page';

describe('CrearvehiculoPage', () => {
  let component: CrearvehiculoPage;
  let fixture: ComponentFixture<CrearvehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearvehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
