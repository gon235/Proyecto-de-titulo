import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'crearpersonal',
    loadChildren: () => import('./crearpersonal/crearpersonal.module').then( m => m.CrearpersonalPageModule)
  },
  {
    path: 'perfil/:id',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'crearvehiculo',
    loadChildren: () => import('./crearvehiculo/crearvehiculo.module').then( m => m.CrearvehiculoPageModule)
  },
  {
    path: 'crearmantencion',
    loadChildren: () => import('./crearmantencion/crearmantencion.module').then( m => m.CrearmantencionPageModule)
  },
  {
    path: 'personal',
    loadChildren: () => import('./personal/personal.module').then( m => m.PersonalPageModule)
  },
  {
    path: 'perfilvehiculo/:id',
    loadChildren: () => import('./perfilvehiculo/perfilvehiculo.module').then( m => m.PerfilvehiculoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
