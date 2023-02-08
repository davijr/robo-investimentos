import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SharedModule } from '../shared/shared.module'
import { EditionPanelComponent } from './pages/edition-panel/edition-panel.component'
import { EditionRoutingModule } from './edition.routing'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'

@NgModule({
  declarations: [
    EditionPanelComponent
  ],
  imports: [
    CommonModule,
    EditionRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TooltipModule.forRoot(),
    BsDatepickerModule
  ],
  exports: [
    EditionPanelComponent
  ]
})
export class EditionModule { }
