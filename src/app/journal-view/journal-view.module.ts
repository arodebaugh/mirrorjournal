import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JournalViewPageRoutingModule } from './journal-view-routing.module';

import { JournalViewPage } from './journal-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JournalViewPageRoutingModule
  ],
  declarations: [JournalViewPage]
})
export class JournalViewPageModule {}
