import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MantencionesPage } from './mantenciones.page';

const routes: Routes = [
  {
    path: '',
    component: MantencionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MantencionesPageRoutingModule {}
