import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JournalViewPage } from './journal-view.page';

const routes: Routes = [
  {
    path: '',
    component: JournalViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JournalViewPageRoutingModule {}
