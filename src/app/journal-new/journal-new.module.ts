import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JournalNewPageRoutingModule } from './journal-new-routing.module';
import { JournalNewPage } from './journal-new.page';
import {AngularEditorModule} from '@kolkov/angular-editor';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        JournalNewPageRoutingModule,
        ReactiveFormsModule,
        AngularEditorModule
    ],
  declarations: [JournalNewPage]
})
export class JournalNewPageModule {}
