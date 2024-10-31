import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearvehiculoPage } from './crearvehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: CrearvehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearvehiculoPageRoutingModule {}
