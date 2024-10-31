import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearvehiculoPageRoutingModule } from './crearvehiculo-routing.module';

import { CrearvehiculoPage } from './crearvehiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearvehiculoPageRoutingModule
  ],
  declarations: [CrearvehiculoPage]
})
export class CrearvehiculoPageModule {}
