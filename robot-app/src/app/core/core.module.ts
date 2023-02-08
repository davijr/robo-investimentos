import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuditComponent } from './pages/audit/audit.component'
import { ReactiveFormsModule } from '@angular/forms'
import { SharedModule } from '../shared/shared.module'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [
    AuditComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TooltipModule.forRoot(),
    BsDatepickerModule
  ]
})
export class CoreModule { }
