import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearpersonalPage } from './crearpersonal.page';

const routes: Routes = [
  {
    path: '',
    component: CrearpersonalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearpersonalPageRoutingModule {}
