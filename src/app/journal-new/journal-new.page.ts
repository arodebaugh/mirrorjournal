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
import { Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {JournalHelpComponent} from '../journal-help/journal-help.component';
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
  unsaved = true;
  first = true;
  autosave = true;
  streakData = null;
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

  constructor(private cdr: ChangeDetectorRef, private navCtrl: NavController, /*private taptic: TapticEngine,*/ private platform: Platform, private pickerController: PickerController, private popoverController: PopoverController, private router: Router, private imagePicker: ImagePicker, private route: ActivatedRoute, private modalCtrl: ModalController, private sanitizer: DomSanitizer, private fb: UntypedFormBuilder, private routerOutlet: IonRouterOutlet, private alertController: AlertController, private toastController: ToastController, private modalController: ModalController, private nativeStorage: NativeStorage) {
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
    
    const tempAutosave = await Preferences.get({key: 'autosave'});
    if (tempAutosave.value) {
      this.autosave = (tempAutosave.value === 'true');
    }

    const tempStreak = await Preferences.get({key: 'streaks'});
    if (tempStreak.value) {
      this.streakData = JSON.parse(tempStreak.value);
    }
  }

  async checkUnsavedChanges() {
    if (this.unsaved && !this.first) {
      // Prompt the user to save changes
      this.presentUnsavedPrompt();
    } else {
      // Navigate back
      this.navCtrl.navigateRoot('/');
    }
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
          date: this.created,
          locked: this.lockState
        });
      }
      try {
        await Filesystem.writeFile({
          path: 'Mirror-app/mirrorJournals.txt',
          data: JSON.stringify(newData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        await Preferences.set({key: "mirrorJournalListCache", value: JSON.stringify(newData)});
        toast.present();
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
      } catch (e) {
        console.error('Unable to write file', e);
      }
    } else {
      const journals = [{
        id: this.journalID,
        date: this.created,
        locked: this.lockState
      }];
      try {
        await Filesystem.writeFile({
          path: 'Mirror-app/mirrorJournals.txt',
          data: JSON.stringify(journals),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        await Preferences.set({key: "mirrorJournalListCache", value: JSON.stringify(journals)});
        Haptics.impact({style: ImpactStyle.Light});
        toast.present();
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
      } catch (e) {
        console.error('Unable to write file', e);
      }
    }
  }

  async saveJournalToFile(saveData, toast) {
    if (this.journalID) {
      const fileName = 'Mirror-app/' + this.journalID + '.txt';
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(this.saveData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        // edit cache
        const contents = await Filesystem.readFile({
          path: 'Mirror-app/mirrorJournalsCache.txt',
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        const cachedJournals = contents.data ? JSON.parse(contents.data) : [];
        const cachedJournalsEditIndex = cachedJournals.findIndex(obj => JSON.parse(obj.data).id === this.journalID);
        if (cachedJournalsEditIndex !== -1) {
          cachedJournals.splice(cachedJournalsEditIndex, 1, { data: JSON.stringify(this.saveData) });
        }

        await Filesystem.writeFile({
          path: 'Mirror-app/mirrorJournalsCache.txt',
          data: JSON.stringify(cachedJournals),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        Haptics.impact({style: ImpactStyle.Light});
        this.unsaved = false;
        this.first = false;
        this.previouslySaved = true;
      } catch (e) {
        alert('Unable to write file ' + JSON.stringify(e));
      }
    } else {
      this.journalID = this.guid();
      this.saveData.id = this.journalID;
      const fileName = 'Mirror-app/' + this.journalID + '.txt';
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(this.saveData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        // add to cache
        try {
          const contents = await Filesystem.readFile({
            path: 'Mirror-app/mirrorJournalsCache.txt',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });

          const cachedJournals = contents.data ? JSON.parse(contents.data) : [];
          cachedJournals.unshift({data: JSON.stringify(this.saveData)});

          await Filesystem.writeFile({
            path: 'Mirror-app/mirrorJournalsCache.txt',
            data: JSON.stringify(cachedJournals),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
        } catch (e) {
          console.log(e);
        }

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

    if (this.streakData) {
      const dayBefore = moment().subtract(1, 'days');
      if (this.streakData.streak == 0 || this.streakData.streak == null) {
        await Preferences.set({key: "streaks", value: JSON.stringify({ lastDate: moment(), streak: 1 })});
      } else if (moment(this.streakData.lastDate).isSame(dayBefore, 'day')) {
        this.streakData = { lastDate: moment(), streak: this.streakData.streak + 1 };
        await Preferences.set({key: "streaks", value: JSON.stringify(this.streakData)});
      }
    } else {
      await Preferences.set({key: "streaks", value: JSON.stringify({ lastDate: moment(), streak: 1 })});
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

        if (this.previouslySaved && this.autosave) {
          this.saveJournalPrompt();
        }
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

        if (this.previouslySaved && this.autosave) {
          this.saveJournalPrompt();
        }
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

  async presentUnsavedPrompt() {
    const alert = await this.alertController.create({
      header: 'Unsaved Changes',
      message: 'Do you want to save your changes before leaving?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Do nothing
          }
        },
        {
          text: 'Don\'t Save',
          handler: () => {
            // Navigate back without saving
            this.navCtrl.back();
          }
        },
        {
          text: 'Save',
          handler: () => {
            // Save changes and navigate back
            this.saveJournalPrompt();
            this.navCtrl.back();
          }
        }
      ]
    });
  
    await alert.present();
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

      if (this.previouslySaved && this.autosave) {
        this.saveJournalPrompt();
      }
    });
    return await modal.present();
  }

  async changeLockState() {
    this.lockState = !this.lockState;
    if (this.lockState && this.passcode === undefined) {
      const { value } = await Preferences.get({key: 'passcode' });
      if (value) {
        this.passcode = value;
        Haptics.impact({style: ImpactStyle.Light});
        this.askForPasscode();
      } else {
        this.openPasswordDialog();
      }
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

    if (this.previouslySaved && this.autosave) {
      this.saveJournalPrompt();
    }
  }

  clearActivity() {
    this.activity = null;
    this.unsaved = true;
    this.first = false;

    if (this.previouslySaved && this.autosave) {
      this.saveJournalPrompt();
    }
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

// Definitions that were not importing correctly from Filesystem
enum Directory {
  /**
   * The Documents directory
   * On iOS it's the app's documents directory.
   * Use this directory to store user-generated content.
   * On Android it's the Public Documents folder, so it's accessible from other apps.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * It's not accesible on Android 11 or newer.
   *
   * @since 1.0.0
   */
  Documents = "DOCUMENTS",
  /**
   * The Data directory
   * On iOS it will use the Documents directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  Data = "DATA",
  /**
   * The Library directory
   * On iOS it will use the Library directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.1.0
   */
  Library = "LIBRARY",
  /**
   * The Cache directory
   * Can be deleted in cases of low memory, so use this directory to write app-specific files
   * that your app can re-create easily.
   *
   * @since 1.0.0
   */
  Cache = "CACHE",
  /**
   * The external directory
   * On iOS it will use the Documents directory
   * On Android it's the directory on the primary shared/external
   * storage device where the application can place persistent files it owns.
   * These files are internal to the applications, and not typically visible
   * to the user as media.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  External = "EXTERNAL",
  /**
   * The external storage directory
   * On iOS it will use the Documents directory
   * On Android it's the primary shared/external storage directory.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * It's not accesible on Android 11 or newer.
   *
   * @since 1.0.0
   */
  ExternalStorage = "EXTERNAL_STORAGE"
}
enum Encoding {
  /**
   * Eight-bit UCS Transformation Format
   *
   * @since 1.0.0
   */
  UTF8 = "utf8",
  /**
   * Seven-bit ASCII, a.k.a. ISO646-US, a.k.a. the Basic Latin block of the
   * Unicode character set
   * This encoding is only supported on Android.
   *
   * @since 1.0.0
   */
  ASCII = "ascii",
  /**
   * Sixteen-bit UCS Transformation Format, byte order identified by an
   * optional byte-order mark
   * This encoding is only supported on Android.
   *
   * @since 1.0.0
   */
  UTF16 = "utf16"
}
