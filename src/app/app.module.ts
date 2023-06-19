import { NgModule } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { TruncateModule } from '@yellowspot/ng-truncate';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { HttpClientModule} from '@angular/common/http';
import { NewAnalyzeComponent } from './new-analyze/new-analyze.component';
import { FormsModule } from '@angular/forms';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import {ImageSettingsComponent} from './image-settings/image-settings.component';
import {SettingsComponent} from './settings/settings.component';
import {PasswordDialogComponent} from './password-dialog/password-dialog.component';
import {WelcomeScreenComponent} from './welcome-screen/welcome-screen.component';
import {NotesListComponent} from './notes-list/notes-list.component';
import {PopupEditorComponent} from './popup-editor/popup-editor.component';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import {CardQuickOptionsComponent} from './card-quick-options/card-quick-options.component';
import {JournalHelpComponent} from './journal-help/journal-help.component';
import { AppRate } from '@awesome-cordova-plugins/app-rate/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import {LocalNotifications} from '@awesome-cordova-plugins/local-notifications/ngx';
import {WhatsNewComponent} from './whats-new/whats-new.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { QuillModule } from 'ngx-quill';

register();

@NgModule({
    declarations: [AppComponent, EmojiPickerComponent, JournalHelpComponent, CardQuickOptionsComponent, NotesListComponent, PopupEditorComponent, RichTextEditorComponent, WelcomeScreenComponent, NewAnalyzeComponent, ImageSettingsComponent, SettingsComponent, PasswordDialogComponent, WhatsNewComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, TruncateModule, HttpClientModule, FormsModule, 
        QuillModule.forRoot({
            modules: {
                // placeholder: 'What are you thinking about?',
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote'],
                
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                  ]
            },
        })],
    providers: [
        NativeStorage,
        ImagePicker,
        EmailComposer,
        AppRate,
        InAppBrowser,
        LocalNotifications,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
