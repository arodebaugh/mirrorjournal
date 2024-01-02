import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {AlertController, IonRouterOutlet, ModalController, NavController, Platform, ToastController} from '@ionic/angular';
import * as moment from 'moment';
import {NativeStorage} from '@awesome-cordova-plugins/native-storage/ngx';
import {NewAnalyzeComponent} from '../new-analyze/new-analyze.component';
import * as CryptoJS from 'crypto-js';
import {NotesListComponent} from '../notes-list/notes-list.component';
import { Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-journal-view',
  templateUrl: './journal-view.page.html',
  styleUrls: ['./journal-view.page.scss'],
})
export class JournalViewPage implements OnInit {
  data: any;
  dateFormatted: string;
  timeToExpire: string;
  passcode: string;
  menuLabel = false;
  fabPos = 1;

  constructor(private platform: Platform, private modalController: ModalController, private alertController: AlertController, private routerOutlet: IonRouterOutlet, private toastController: ToastController, private route: ActivatedRoute, private router: Router, private navCtrl: NavController, private nativeStorage: NativeStorage) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.journal;
        if (this.router.getCurrentNavigation().extras.state.passcode) {
          this.passcode = this.router.getCurrentNavigation().extras.state.passcode;
        }

        if (this.router.getCurrentNavigation().extras.state.action === 'edit') {
          this.editJournal();
        } else if (this.router.getCurrentNavigation().extras.state.action === 'delete') {
          this.trashJournal();
        } else if (this.router.getCurrentNavigation().extras.state.action === 'create') {
          this.analyzeJournal();
        }
        this.dateFormatted = moment(this.data.date).format('LLLL');
      } else {
        this.navCtrl.navigateBack('/');
      }
    });
  }

  async ngOnInit() {
    const tempMenuLabel = await Preferences.get({key: 'menuLabel'});
    if (tempMenuLabel.value) {
      this.menuLabel = (tempMenuLabel.value === 'true');
    }

    this.platform.ready().then(() => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        Keyboard.setStyle({style: KeyboardStyle.Dark});
      } else {
        Keyboard.setStyle({style: KeyboardStyle.Light});
      }
    });
  }

  ionViewWillLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  async ionViewDidEnter() {
    const tempMenuplacment = await Preferences.get({key: 'menuplacement'});
    if (tempMenuplacment.value) {
      this.fabPos = parseInt(tempMenuplacment.value);
    }

    const timeToExpireString = this.data.expire.split(' ');
    const timeToExpireMoment = moment(this.data.date);
    const hourDiff = moment().diff(timeToExpireMoment, 'hours');
    let hoursToCountdown;
    if (timeToExpireString[1] === 'Days' || timeToExpireString[1] === 'Day') {
      hoursToCountdown = timeToExpireString[0] * 24;
    } else if (timeToExpireString[1] === 'Weeks' || timeToExpireString[1] === 'Week') {
      hoursToCountdown = (timeToExpireString[0] * 7) * 24;
    } else if (timeToExpireString[1] === 'Months' || timeToExpireString[1] === 'Month') {
      hoursToCountdown = (timeToExpireString[0] * 30) * 24;
    } else if (timeToExpireString[1] === 'Years' || timeToExpireString[1] === 'Year') {
      hoursToCountdown = (timeToExpireString[0] * 365) * 24;
    }
    let hoursLeft = Math.round(hoursToCountdown - hourDiff);
    if (hoursLeft < 0) {
      alert('This should have been deleted?');
    } else {
      this.timeToExpire = '';
      const yearsLeft = Math.floor(hoursLeft / 8760);
      hoursLeft = hoursLeft % 8760;
      const monthsLeft = Math.floor(hoursLeft / 720);
      hoursLeft = hoursLeft % 720;
      const weeksLeft = Math.floor(hoursLeft / 168);
      hoursLeft = hoursLeft % 168;
      const daysLeft = Math.floor(hoursLeft / 24);
      hoursLeft = hoursLeft % 24;
      if (yearsLeft > 1) {
        this.timeToExpire += yearsLeft + ' Years';
      } else if (yearsLeft === 1) {
        this.timeToExpire += yearsLeft + ' Year';
      }

      if (monthsLeft > 1) {
        this.timeToExpire += ' ' + yearsLeft + ' Months';
      } else if (monthsLeft === 1) {
        this.timeToExpire += ' ' + yearsLeft + ' Month';
      }

      if (weeksLeft > 1) {
        this.timeToExpire += ' ' + weeksLeft + ' Weeks';
      } else if (weeksLeft === 1) {
        this.timeToExpire += ' ' + weeksLeft + ' Week';
      }

      if (daysLeft > 1) {
        this.timeToExpire += ' ' + daysLeft + ' Days';
      } else if (daysLeft === 1) {
        this.timeToExpire += ' ' + daysLeft + ' Day';
      }

      if (hoursLeft > 1) {
        this.timeToExpire += ' ' + hoursLeft + ' Hours';
      } else if (hoursLeft === 1) {
        this.timeToExpire += ' ' + hoursLeft + ' Hour';
      }

      this.timeToExpire = this.timeToExpire.trim();
    }
  }

  async deleteJournal(toast) {
    const data = this.data;

    // Delete file
    await Filesystem.deleteFile({
      path: 'Mirror-Journal-app/' + data.id + '.txt',
      directory: Directory.Documents
    });

    // Remove journal from directory file
    const contents = await Filesystem.readFile({
      path: 'Mirror-Journal-app/mirrorJournals.txt',
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    let outParsed = JSON.parse(contents.data);
    outParsed = outParsed.filter(returnableObjects => returnableObjects.id !== data.id);

    try {
      await Filesystem.writeFile({
        path: 'Mirror-Journal-app/mirrorJournals.txt',
        data: JSON.stringify(outParsed),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      
      // Remove journal from cache file
      const cacheContents = await Filesystem.readFile({
        path: 'Mirror-Journal-app/mirrorJournalsCache.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      let cacheOutParsed = JSON.parse(cacheContents.data);
      let filteredOutParsed = cacheOutParsed.filter(returnableObjects => JSON.parse(returnableObjects.data).id !== data.id);
      if (filteredOutParsed.length === cacheOutParsed.length) {
        // No journal with matching id was found, filter by date instead
        filteredOutParsed = cacheOutParsed.filter(returnableObjects => JSON.parse(returnableObjects.data).date !== data.date);
      }
      await Filesystem.writeFile({
        path: 'Mirror-Journal-app/mirrorJournalsCache.txt',
        data: JSON.stringify(filteredOutParsed),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
    } catch (e) {
      console.error('Unable to write file', e);
    }

    // Success
    Haptics.notification({type: NotificationType.Success});
    toast.present();
    this.navCtrl.navigateBack('/');
  }
  

  async trashJournal() {
    const toast = await this.toastController.create({
      message: 'Your journal \'' + this.data.name + '\' has been deleted.',
      position: 'top',
      color: 'primary',
      duration: 2000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            // log('Cancel clicked');
          }
        }]
    });

    const alert = await this.alertController.create({
      header: '🚨 Are you sure? 🚨',
      message: 'This action cannot be reversed.',
      buttons: [
        {
          text: 'Never mind',
          role: 'cancel'
        }, {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.deleteJournal(toast);
          }
        }
      ]
    });

    await alert.present();
  }

  async askForPasscode(modal) {
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
            this.passcode = undefined;
            Haptics.impact({style: ImpactStyle.Light});
          }
        }, {
          text: 'Ok',
          handler: out => {
            if (CryptoJS.AES.decrypt(this.passcode, out.passcode).toString(CryptoJS.enc.Utf8) === 'passcode') {
              Haptics.impact({style: ImpactStyle.Light});
              this.passcode = out.passcode;
              modal.present();
            } else {
              this.askForPasscode(modal);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async saveNoteToFile(saveData, toast) {
    const fileName = 'Mirror-Journal-app/' + this.data.id + '.txt';
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(this.data),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      // log('Wrote file', result);
      toast.present();
    } catch (e) {
      console.error('Unable to write file', e);
    }
    this.data.content = CryptoJS.AES.decrypt(this.data.content, this.passcode).toString(CryptoJS.enc.Utf8);
    this.data.notes = JSON.parse(CryptoJS.AES.decrypt(this.data.notes, this.passcode).toString(CryptoJS.enc.Utf8));
  }

  tryToEncrypt(saveData, toast) {
    if (this.data.locked) {
      this.data.content = CryptoJS.AES.encrypt(this.data.content, this.passcode).toString();
      this.data.notes = CryptoJS.AES.encrypt(JSON.stringify(this.data.notes), this.passcode).toString();
    }
    this.saveNoteToFile(saveData, toast);
  }

  async analyzeJournal() {
    const toast = await this.toastController.create({
      message: 'Your note has been saved!',
      position: 'top',
      color: 'primary',
      duration: 2000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }]
    });
    const modal = await this.modalController.create({
      component: NewAnalyzeComponent,
      componentProps: {
        pickerName: 'New Note',
        data: this.data,
        newNote: true
      }
    });
    modal.onDidDismiss().then(dataReturned => {
      if (dataReturned !== null && dataReturned.data !== undefined) {
        if (this.data.notes) {
          this.data.notes.push(dataReturned.data);
        } else {
          this.data.notes = [dataReturned.data];
        }
        this.data.notes = this.data.notes.filter(e => e);
        this.tryToEncrypt(this.data, toast);
      }
    });

    if (this.data.locked) {
      this.nativeStorage.getItem('passcode').then((out) => {
        this.passcode = out;
        this.askForPasscode(modal);
      }).catch(err => {
        alert('Error getting passcode ' + err);
      });
    } else {
      Haptics.impact({style: ImpactStyle.Light});
      await modal.present();
    }
  }

  async viewNotes() {
    const toast = await this.toastController.create({
      message: 'Your note has been deleted!',
      position: 'top',
      color: 'primary',
      duration: 2000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }]
    });
    Haptics.impact({style: ImpactStyle.Light});
    const modal = await this.modalController.create({
      component: NotesListComponent,
      componentProps: {
        notes: this.data.notes
      }
    });
    modal.onDidDismiss().then(dataReturned => {
      if (dataReturned !== null && dataReturned.data !== undefined) {
        if (dataReturned.data === 1) {
          this.analyzeJournal();
        } else {
          this.data.notes = this.data.notes.filter(f => f !== dataReturned.data);
          this.tryToEncrypt(this.data, toast);
        }
      } else {
        Haptics.impact({style: ImpactStyle.Light});
      }
    });
    await modal.present();
  }

  editJournal() {
    Haptics.impact({style: ImpactStyle.Light});
    let navigationExtras: NavigationExtras;
    if (this.passcode) {
      navigationExtras = {
        state: {
          journalName: this.data.name,
          expireLabelText: this.data.expire,
          mood: this.data.mood,
          activity: this.data.activity,
          created: this.data.date,
          journalContent: this.data.content,
          journalID: this.data.id,
          headerImageData: this.data.headerImage,
          lockState: this.data.locked,
          passcode: this.passcode
        }
      };
    } else {
      navigationExtras = {
        state: {
          journalName: this.data.name,
          expireLabelText: this.data.expire,
          mood: this.data.mood,
          activity: this.data.activity,
          created: this.data.date,
          journalContent: this.data.content,
          journalID: this.data.id,
          headerImageData: this.data.headerImage,
          lockState: this.data.locked
        }
      };
    }
    this.navCtrl.navigateForward('/journal-new', navigationExtras);
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
