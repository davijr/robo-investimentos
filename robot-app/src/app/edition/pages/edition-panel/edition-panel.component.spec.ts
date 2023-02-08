import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EditionPanelComponent } from './edition-panel.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from 'src/app/app.routing';

describe('EditionPanelComponent', () => {
  let component: EditionPanelComponent;
  let fixture: ComponentFixture<EditionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppRoutingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        ModalModule.forRoot()
      ],
      declarations: [ EditionPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
