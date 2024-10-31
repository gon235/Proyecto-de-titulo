import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MantencionDetallePage } from './mantencion-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: MantencionDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MantencionDetallePageRoutingModule {}
