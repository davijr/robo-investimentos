import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OportunityComponent } from './oportunity.component';

describe('OportunityComponent', () => {
  let component: OportunityComponent;
  let fixture: ComponentFixture<OportunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OportunityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
