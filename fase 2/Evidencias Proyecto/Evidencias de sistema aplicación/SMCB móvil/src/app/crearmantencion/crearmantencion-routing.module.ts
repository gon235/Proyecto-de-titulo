import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearmantencionPage } from './crearmantencion.page';

const routes: Routes = [
  {
    path: '',
    component: CrearmantencionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearmantencionPageRoutingModule {}
