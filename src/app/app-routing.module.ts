import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule), canActivate:[AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'crearpersonal',
    loadChildren: () => import('./crearpersonal/crearpersonal.module').then( m => m.CrearpersonalPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'perfil/:id',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'crearvehiculo',
    loadChildren: () => import('./crearvehiculo/crearvehiculo.module').then( m => m.CrearvehiculoPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'crearmantencion',
    loadChildren: () => import('./crearmantencion/crearmantencion.module').then( m => m.CrearmantencionPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'personal',
    loadChildren: () => import('./personal/personal.module').then( m => m.PersonalPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'perfilvehiculo/:id',
    loadChildren: () => import('./perfilvehiculo/perfilvehiculo.module').then( m => m.PerfilvehiculoPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule), canActivate:[NoAuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
