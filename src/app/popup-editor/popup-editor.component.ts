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
  fontsize = '';
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'What are you thinking about?',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'}
    ],
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'fontSize', 'insertVideo', 'removeFormat', 'link', 'unlink', 'subscript',
        'superscript', 'indent',
        'outdent', 'insertUnorderedList',
        'insertOrderedList', 'undo',
        'redo', 'textColor',
        'backgroundColor', 'insertHorizontalRule',
        'removeFormat', 'toggleEditorMode', 'fontName', 'insertImage']
    ]
  };

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

  async ionViewDidEnter() {
    const tempFontsize = await Preferences.get({key: 'fontsize'});
    if (tempFontsize.value) {
      this.fontsize = tempFontsize.value;
      if (this.fontsize === 'default') {
        this.fontsize = '';
      } else {
        this.fontsize = this.fontsize + 'px';
      }
    }
    // this.editorConfig.defaultFontSize = this.fontsize;
  }

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
