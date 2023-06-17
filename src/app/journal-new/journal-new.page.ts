// Todo: currently file system only works for iOS.

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
  AlertController,
  IonRouterOutlet,
  ModalController,
  NavController,
  PickerController,
  Platform,
  PopoverController,
  ToastController
} from '@ionic/angular';
import {NativeStorage} from '@awesome-cordova-plugins/native-storage/ngx';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';
import {UntypedFormBuilder} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import * as moment from 'moment';
import {ImagePicker} from '@awesome-cordova-plugins/image-picker/ngx';
import {ActivatedRoute, Router} from '@angular/router';
import {ImageSettingsComponent} from '../image-settings/image-settings.component';
import * as CryptoJS from 'crypto-js';
import {PasswordDialogComponent} from '../password-dialog/password-dialog.component';
import {PopupEditorComponent} from '../popup-editor/popup-editor.component';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {JournalHelpComponent} from '../journal-help/journal-help.component';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { Preferences } from '@capacitor/preferences';

const options = [
  [
    '',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10'
  ],
  [
    'Never',
    'Days',
    'Weeks',
    'Months',
    'Years'
  ]
];

@Component({
  selector: 'app-journal-new',
  templateUrl: './journal-new.page.html',
  styleUrls: ['./journal-new.page.scss'],
})
export class JournalNewPage implements OnInit {
  journalName = 'New Journal Entry';
  expireLabelText = 'Never';
  mood = '😊';
  activity = '✍️';
  previouslySaved = false;
  created = moment().format();
  journalContent = '';
  journalID = '';
  headerImageData = '';
  newJournal: boolean;
  lockState = false;
  modalUp = false;
  memories = true;
  speaking = false;
  fontsize = 'default';
  unsaved = true;
  first = true;
  autosave = true;
  private passcode: string;
  saveData = {
    name: this.journalName,
    locked: this.lockState,
    date: this.created,
    expire: this.expireLabelText,
    mood: this.mood,
    activity: this.activity,
    headerImage: this.headerImageData,
    content: this.journalContent,
    id: this.journalID,
    hideMemories: !this.memories
  };
  guid = () => {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    };

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  constructor(private cdr: ChangeDetectorRef, private speechRecognition: SpeechRecognition, private navCtrl: NavController, /*private taptic: TapticEngine,*/ private platform: Platform, private pickerController: PickerController, private popoverController: PopoverController, private router: Router, private imagePicker: ImagePicker, private route: ActivatedRoute, private modalCtrl: ModalController, private sanitizer: DomSanitizer, private fb: UntypedFormBuilder, private routerOutlet: IonRouterOutlet, private alertController: AlertController, private toastController: ToastController, private modalController: ModalController, private nativeStorage: NativeStorage) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.journalName = this.router.getCurrentNavigation().extras.state.journalName;
        this.expireLabelText = this.router.getCurrentNavigation().extras.state.expireLabelText;
        this.mood = this.router.getCurrentNavigation().extras.state.mood;
        this.activity = this.router.getCurrentNavigation().extras.state.activity;
        this.previouslySaved = true;
        this.created = this.router.getCurrentNavigation().extras.state.created;
        this.journalContent = this.router.getCurrentNavigation().extras.state.journalContent;
        this.journalID = this.router.getCurrentNavigation().extras.state.journalID;
        this.headerImageData = this.router.getCurrentNavigation().extras.state.headerImageData;
        this.lockState = this.router.getCurrentNavigation().extras.state.lockState;
        if (this.router.getCurrentNavigation().extras.state.passcode) {
          this.passcode = this.router.getCurrentNavigation().extras.state.passcode;
        }
        this.newJournal = false;
      } else {
        this.newJournal = true;
      }
    });
  }

  ngOnInit() { }

  async ionViewDidEnter() {
    this.modalUp = false;
    this.unsaved = true;
    this.first = true;
    const tempFontsize = await Preferences.get({key: 'fontsize'});
    if (tempFontsize.value) {
      this.fontsize = tempFontsize.value;
      if (this.fontsize === 'default') {
        this.fontsize = '';
      } else {
        this.fontsize = this.fontsize + 'px';
      }
    }

    const tempAutosave = await Preferences.get({key: 'autosave'});
    if (tempAutosave.value) {
      this.autosave = (tempAutosave.value === 'true');
    }
  }

  stopSpeak() {
    this.speechRecognition.stopListening().then(() => {
      this.speaking = false;
    }).catch(err => {
      alert('error: ' + err);
    });
  }

  speak() {
    this.speechRecognition.isRecognitionAvailable()
        .then((available: boolean) => {
          if (available) {
            this.speechRecognition.hasPermission()
                .then((hasPermission: boolean) => {
                  if (!hasPermission) {
                    this.speechRecognition.requestPermission()
                        .then(
                            () => console.log('Granted'),
                            () => console.log('Denied')
                        );
                  }

                  this.speaking = true;

                  this.speechRecognition.startListening({
                    prompt: 'Speech to text feature for creating journals.'
                  })
                      .subscribe(
                          (matches: string[]) => {
                            if (this.journalContent === '') {
                              this.journalContent = matches[0];
                            } else {
                              this.journalContent += '<br/><br/>' + matches[0];
                            }
                            this.cdr.detectChanges();
                            this.unsaved = true;
                            this.first = false;
                          },
                          err => {
                            this.speaking = false;
                            console.log(err);
                          }
                      );
                });
          } else {
            alert('Speak Recognition is not available for this device ');
          }
    });
  }

  async setExpire() {
    const picker = await this.pickerController.create({
      columns: this.getColumns(2, 11, options),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            // console.log(`Got Value ` + JSON.stringify(value));
            if (value['col-1'].text === 'Never') {
              Haptics.impact({style: ImpactStyle.Light});
              // this.taptic.selection();
              this.expireLabelText = 'Never';
            } else if (value['col-0'].text === '') {
              Haptics.notification({type: NotificationType.Error});
              // this.taptic.notification({type: 'error'});
              alert('Please set a number value!');
            } else {
              Haptics.impact({style: ImpactStyle.Light});
              // this.taptic.selection();
              if (parseInt(value['col-0'].text) > 1) {
                this.expireLabelText = value['col-0'].text + ' ' + value['col-1'].text;
              } else {
                this.expireLabelText = value['col-0'].text + ' ' + (value['col-1'].text).slice(0, -1);
              }
            }
            this.unsaved = true;
            this.first = false;
          }
        }
      ]
    });

    await picker.present();
  }

  getColumns(numColumns, numOptions, columnOptions) {
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
      columns.push({
        name: `col-${i}`,
        options: this.getColumnOptions(i, numOptions, columnOptions)
      });
    }

    return columns;
  }

  getColumnOptions(columnIndex, numOptions, columnOptions) {
    const op = [];
    for (let i = 0; i < numOptions; i++) {
      op.push({
        text: columnOptions[columnIndex][i % numOptions],
        value: i
      });
    }

    return op;
  }

  async writeToMasterDir(saveData, toast) {
    const contents = await Filesystem.readFile({
      path: 'Mirror-app/mirrorJournals.txt',
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    if (contents.data) {
      // @ts-ignore
      const newData = JSON.parse(contents.data);
      if (!this.previouslySaved) {
        newData.push({
          id: this.journalID,
          date: this.created
        });
      }
      try {
        const result = await Filesystem.writeFile({
          path: 'Mirror-app/mirrorJournals.txt',
          data: JSON.stringify(newData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        toast.present();
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
        // console.log('Wrote file', result);
      } catch (e) {
        console.error('Unable to write file', e);
      }
    } else {
      const journals = [{
        id: this.journalID,
        date: this.created
      }];
      try {
        const result = await Filesystem.writeFile({
          path: 'Mirror-app/mirrorJournals.txt',
          data: JSON.stringify(journals),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        Haptics.impact({style: ImpactStyle.Light});
        // this.taptic.notification({type: 'success'});
        toast.present();
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
        // console.log('Wrote file', result);
      } catch (e) {
        console.error('Unable to write file', e);
      }
    }
  }

  async saveJournalToFile(saveData, toast) {
    if (this.journalID) {
      const fileName = 'Mirror-app/' + this.journalID + '.txt';
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(this.saveData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        // console.log('Wrote file', result);
        Haptics.impact({style: ImpactStyle.Light});
        // this.taptic.notification({type: 'success'});
        // toast.present();
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
      } catch (e) {
        alert('Unable to write file ' + JSON.stringify(e));
      }
    } else {
      this.journalID = this.guid();
      const fileName = 'Mirror-app/' + this.journalID + '.txt';
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(this.saveData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        this.writeToMasterDir(saveData, toast);
        console.log('Wrote file', result);
      } catch (e) {
        alert('Unable to write file ' + JSON.stringify(e));
      }
    }
  }

  tryToEncrypt(saveData, toast) {
    if (this.lockState) {
      this.saveData.content = CryptoJS.AES.encrypt(this.saveData.content, this.passcode).toString();
    }
    this.saveJournalToFile(saveData, toast);
  }

  async saveJournal() {
    const toast = await this.toastController.create({
      message: 'Your journal \'' + this.journalName + '\' has been saved!',
      position: 'top',
      color: 'primary',
      duration: 2000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });

    this.saveData = {
      name: this.journalName,
      locked: this.lockState,
      date: this.created,
      expire: this.expireLabelText,
      mood: this.mood,
      activity: this.activity,
      headerImage: this.headerImageData,
      content: this.journalContent,
      id: this.journalID,
      hideMemories: !this.memories
    };
    try {
      await Filesystem.mkdir({
        path: 'Mirror-app',
        directory: Directory.Documents,
        recursive: false // like mkdir -p
      });
      this.tryToEncrypt(this.saveData, toast);
    } catch (e) {
      this.tryToEncrypt(this.saveData, toast);
      console.error('Unable to make directory', e);
    }
  }

  async editName() {
    const past = this.previouslySaved;
    this.previouslySaved = false;
    this.saveJournalPrompt(past);
  }

  async saveJournalPrompt(past = false) {
    if (this.previouslySaved) {
      this.saveJournal();
    } else {
      const alert = await this.alertController.create({
        header: 'Title',
        inputs: [
          {
            name: 'title',
            type: 'text',
            value: past ? this.journalName : '',
            placeholder: 'Journal entry for ' + moment().format('MMMM Do, YYYY')
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Ok',
            handler: (out) => {
              if (out.title.trim() === '') {
                this.journalName = 'Journal entry for ' + moment().format('MMMM Do, YYYY');
              } else {
                this.journalName = out.title;
              }
              if (!this.previouslySaved) {
                this.created = moment().format();
              }
              this.saveJournal();
            }
          }
        ]
      });

      await alert.present();
    }
  }

  async expandEditor() {
    // this.taptic.selection();
    const modal = await this.modalController.create({
      component: PopupEditorComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        journalContent: this.journalContent
      },
      backdropDismiss: false
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.journalContent = dataReturned.data;
        if (this.journalContent === '') {
          this.modalUp = false;
        } else {
          this.unsaved = true;
          this.first = false;

          if (this.previouslySaved && this.autosave) {
            this.saveJournalPrompt();
          }
        }
      }
    });
    this.modalUp = true;
    this.journalContent = '';
    return await modal.present();
  }

  async presentEmojiModalMood() {
    const modal = await this.modalController.create({
      component: EmojiPickerComponent,
      componentProps: {
        pickerName: 'Mood',
        currentEmoji: this.mood
      }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.mood = dataReturned.data;
        this.unsaved = true;
        this.first = false;
      }
    });
    return await modal.present();
  }

  async presentEmojiModalActivity() {
    Haptics.impact({style: ImpactStyle.Light});
    // this.taptic.selection();
    const modal = await this.modalController.create({
      component: EmojiPickerComponent,
      componentProps: {
        pickerName: 'Activity',
        currentEmoji: this.activity
      }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.activity = dataReturned.data;
        this.unsaved = true;
        this.first = false;
      }
    });
    return await modal.present();
  }

  imageSelectorForHeader() {
    this.imagePicker.getPictures({
      maximumImagesCount: 1,
      outputType: 1,
      disable_popover: true
    }).then((out) => {
      if (out.length  === 1) {
        if (out[0]) {
          this.headerImageData = 'data:image/jpeg;base64,' + out[0];
          this.unsaved = true;
          this.first = false;
        }
      }
    }).catch((err) => {
      alert('Error: ' + err);
    });
    Haptics.impact({style: ImpactStyle.Light});
    // this.taptic.selection();
  }

  insertNewHeader() {
    this.imagePicker.hasReadPermission().then((out) => {
      if (out) {
        this.imageSelectorForHeader();
      } else {
        this.imagePicker.requestReadPermission().then(() => {
          this.imageSelectorForHeader();
        }).catch((err) => {
          alert('Error: ' + err);
        });
      }
    });
  }

  async presentImageSettings(ev: any) {
    const popover = await this.popoverController.create({
      component: ImageSettingsComponent,
      event: ev,
      translucent: true
    });
    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data === 'delete') {
        this.headerImageData = null;
      } else if (dataReturned.data === 'change') {
        this.insertNewHeader();
      }
    });
    return await popover.present();
  }

  async help(ev: any) {
    const popover = await this.popoverController.create({
      component: JournalHelpComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  async askForPasscode() {
    const alert = await this.alertController.create({
      message: 'What is your passcode?',
      inputs: [{
        name: 'passcode',
        type: 'password' as 'number' | 'text' | 'date' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'time' | 'checkbox' | 'radio' | 'textarea',
        placeholder: 'passcode',
        attributes: {
          inputmode: 'numeric',
          pattern: '[0-9]*'
        }
      }],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
              this.passcode = undefined;
              this.lockState = false;
              // this.taptic.selection();
            }
          }, {
            text: 'Ok',
            handler: out => {
              if (CryptoJS.AES.decrypt(this.passcode, out.passcode).toString(CryptoJS.enc.Utf8) === 'passcode') {
                this.passcode = out.passcode;
                // this.taptic.notification({type: 'success'});
              } else {
                // this.taptic.notification({type: 'error'});
                this.passcode = undefined;
                this.lockState = false;
                this.changeLockState();
              }
            }
          }
        ]
    });
    await alert.present();
  }

  async openPasswordDialog() {
    const modal = await this.modalController.create({
      component: PasswordDialogComponent
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null && dataReturned.data !== '') {
        this.passcode = dataReturned.data;
      } else {
        this.lockState = false;
      }
      this.unsaved = true;
      this.first = false;
    });
    return await modal.present();
  }

  async changeLockState() {
    this.lockState = !this.lockState;
    if (this.lockState && this.passcode === undefined) {
      this.nativeStorage.getItem('passcode').then((out) => {
        this.passcode = out;
        this.askForPasscode();
      }).catch(err => {
        console.log('Error getting passcode ' + err);
        this.openPasswordDialog();
      });
    }
  }

  changeMemoriesState() {
    this.memories = !this.memories;
    this.unsaved = true;
    this.first = false;
  }

  clearMood() {
    this.mood = null;
    this.unsaved = true;
    this.first = false;
  }

  clearActivity() {
    this.activity = null;
    this.unsaved = true;
    this.first = false;
  }

  resetJournal() {
    this.journalName = 'New Journal';
    this.expireLabelText = 'Never';
    this.mood = '😐';
    this.activity = '✍️';
    this.previouslySaved = false;
    this.created = moment().format();
    this.journalContent = '';
    this.journalID = undefined;
    this.headerImageData = undefined;
    this.newJournal = undefined;
    this.lockState = false;
    this.passcode = undefined;
    this.memories = true;
    this.saveData = {
      name: this.journalName,
      locked: this.lockState,
      date: this.created,
      expire: this.expireLabelText,
      mood: this.mood,
      activity: this.activity,
      headerImage: this.headerImageData,
      content: this.journalContent,
      id: this.journalID,
      hideMemories: !this.memories
    };
  }

  ionViewWillLeave() {
    this.resetJournal();
  }
}
