import {Component, Input, OnInit} from '@angular/core';
import {AngularEditorConfig} from '@kolkov/angular-editor';
import {ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-popup-editor',
  templateUrl: './popup-editor.component.html',
  styleUrls: ['./popup-editor.component.scss'],
})
export class PopupEditorComponent implements OnInit {
  @Input() journalContent = '';
  @Input() fullscreen = false;
  editor: any;

  constructor(private modalController: ModalController, private platform: Platform) { }

  async ngOnInit() {
    this.platform.ready().then(() => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        Keyboard.setStyle({style: KeyboardStyle.Dark});
      } else {
        Keyboard.setStyle({style: KeyboardStyle.Light});
      }
    });
  }

  async ionViewDidEnter() { }

  async dismiss() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.modalController.dismiss(this.journalContent);
  }

  async fullScreen() {
    /*const modal = await this.modalController.create({
      component: PopupEditorComponent,
      componentProps: {
        journalContent: this.journalContent,
        fullscreen: true
      },
      cssClass: 'modal-fullscreen',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.modalController.dismiss(dataReturned.data);
      }
    });
    await modal.present();*/
  }
}
