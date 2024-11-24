import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'crearpersonal',
    loadChildren: () => import('./crearpersonal/crearpersonal.module').then( m => m.CrearpersonalPageModule),
    canActivate: [AuthGuard, RoleGuard]
  },
  {
    path: 'personal',
    loadChildren: () => import('./personal/personal.module').then( m => m.PersonalPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos',
    loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil/:id',
    loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'crearvehiculo',
    loadChildren: () => import('./crearvehiculo/crearvehiculo.module').then( m => m.CrearvehiculoPageModule),
    canActivate: [AuthGuard, RoleGuard]
  },
  {
    path: 'perfilvehiculo/:id',
  loadChildren: () => import('./perfilvehiculo/perfilvehiculo.module').then( m => m.PerfilvehiculoPageModule),
  canActivate: [AuthGuard]
  },
  {
    path: 'crearmantencion',
    loadChildren: () => import('./crearmantencion/crearmantencion.module').then( m => m.CrearmantencionPageModule),
    canActivate: [AuthGuard, RoleGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'recuperar-password',
    loadChildren: () => import('./pages/recuperar-password/recuperar-password.module').then( m => m.RecuperarPasswordPageModule)
  },
  {
    path: 'mantencion-detalle/:id',
    loadChildren: () => import('./mantencion-detalle/mantencion-detalle.module').then( m => m.MantencionDetallePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mantenciones',
    loadChildren: () => import('./mantenciones/mantenciones.module').then( m => m.MantencionesPageModule)
  },
  {
    path: 'reportes',
    loadChildren: () => import('./reportes/reportes.module').then( m => m.ReportesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
