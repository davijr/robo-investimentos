import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { EditionPanelComponent } from './pages/edition-panel/edition-panel.component'

const editionRoutes: Routes = [
  { path: 'edition/:editionModel', component: EditionPanelComponent/*, canActivate: [AuthGuard] */ }
]

@NgModule({
  imports: [RouterModule.forChild(editionRoutes)],
  exports: [RouterModule]
})
export class EditionRoutingModule {}
