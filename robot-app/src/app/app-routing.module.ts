import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { OrdersComponent } from './pages/orders/orders.component'
import { PanelComponent } from './pages/panel/panel.component'
import { PricesComponent } from './pages/prices/prices.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { OportunityComponent } from './pages/oportunity/oportunity.component'

const routes: Routes = [
  { path: '', redirectTo: '/panel', pathMatch: 'full' },
  { path: 'panel', component: PanelComponent },
  { path: 'prices', component: PricesComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'oportunity', component: OportunityComponent },
  { path: 'settings', component: SettingsComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
