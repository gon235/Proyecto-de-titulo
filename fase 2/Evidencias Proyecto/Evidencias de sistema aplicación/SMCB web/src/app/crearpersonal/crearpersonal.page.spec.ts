import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearpersonalPage } from './crearpersonal.page';

describe('CrearpersonalPage', () => {
  let component: CrearpersonalPage;
  let fixture: ComponentFixture<CrearpersonalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearpersonalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
