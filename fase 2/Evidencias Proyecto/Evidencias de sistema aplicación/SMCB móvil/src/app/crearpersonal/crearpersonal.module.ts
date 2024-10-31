import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearpersonalPageRoutingModule } from './crearpersonal-routing.module';

import { CrearpersonalPage } from './crearpersonal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearpersonalPageRoutingModule
  ],
  declarations: [CrearpersonalPage]
})
export class CrearpersonalPageModule {}
