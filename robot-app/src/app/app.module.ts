import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AuthenticationModule } from './authentication/authentication.module'
import { AuthGuard } from './authentication/guards/auth.guard'
import { AuthService } from './authentication/services/auth.service'
import { CoreModule } from './core/core.module'
import { ApiService } from './core/services/api.service'
import { EditionModule } from './edition/edition.module'
import { SharedModule } from './shared/shared.module'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSliderModule } from '@angular/material/slider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { ModalModule } from 'ngx-bootstrap/modal'
import { OrdersComponent } from './pages/orders/orders.component'
import { PricesComponent } from './pages/prices/prices.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { TableComponent } from './components/table/table.component'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { PanelComponent } from './pages/panel/panel.component'

@NgModule({
  declarations: [
    AppComponent,
    PanelComponent,
    PricesComponent,
    SettingsComponent,
    OrdersComponent,
    TableComponent
  ],
  imports: [
    MatTableModule,
    MatCardModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    // app modules
    CoreModule,
    SharedModule,
    AuthenticationModule,
    // feature modules
    EditionModule,
    // routing modules
    AppRoutingModule,
    // material modules
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSliderModule,
    MatListModule,
    MatProgressSpinnerModule,
    AccordionModule, // TODO
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot()
  ],
  providers: [
    ApiService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
