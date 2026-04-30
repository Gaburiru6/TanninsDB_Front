import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtigoForm } from './artigo-form';

describe('ArtigoForm', () => {
  let component: ArtigoForm;
  let fixture: ComponentFixture<ArtigoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtigoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtigoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
