import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { AlertModule } from 'ngx-bootstrap/alert'
import { TooltipModule } from 'ngx-bootstrap/tooltip'

import { AlertModalComponent } from './components/alert-modal/alert-modal.component'
import { DebugFormComponent } from './components/debug-form/debug-form.component'
import { TableFormComponent } from './components/table-form/table-form.component'

import { OptionsService } from './services/options.service'
import { PromptModalComponent } from './components/prompt-modal/prompt-modal.component'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { PrettyJsonComponent } from './components/pretty-json/pretty-json.component'

@NgModule({
  declarations: [
    AlertModalComponent,
    PromptModalComponent,
    DebugFormComponent,
    TableFormComponent,
    PrettyJsonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    TooltipModule,
    AlertModule.forRoot(),
    BsDatepickerModule
  ],
  exports: [
    AlertModalComponent,
    PromptModalComponent,
    TableFormComponent,
    DebugFormComponent,
    PrettyJsonComponent
  ],
  entryComponents: [
    AlertModalComponent,
    PromptModalComponent],
  providers: [OptionsService]
})
export class SharedModule { }
