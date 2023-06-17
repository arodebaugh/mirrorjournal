import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JournalNewPage } from './journal-new.page';

const routes: Routes = [
  {
    path: '',
    component: JournalNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JournalNewPageRoutingModule {}
