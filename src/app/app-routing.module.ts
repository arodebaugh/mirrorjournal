import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {IonRouterOutlet} from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'journal-view',
    loadChildren: () => import('./journal-view/journal-view.module').then( m => m.JournalViewPageModule)
  },
  {
    path: 'journal-new',
    loadChildren: () => import('./journal-new/journal-new.module').then( m => m.JournalNewPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
