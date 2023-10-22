import {Component, OnInit, ViewChild} from '@angular/core';
import {
  AlertController,
  IonInfiniteScroll,
  IonRouterOutlet,
  IonSearchbar,
  ModalController,
  NavController,
  Platform,
  PopoverController
} from '@ionic/angular';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import * as moment from 'moment';
import { NavigationExtras } from '@angular/router';
import {SettingsComponent} from '../settings/settings.component';
import * as CryptoJS from 'crypto-js';
import {PasswordDialogComponent} from '../password-dialog/password-dialog.component';
import {WelcomeScreenComponent} from '../welcome-screen/welcome-screen.component';
import { Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {CardQuickOptionsComponent} from '../card-quick-options/card-quick-options.component';
import {WhatsNewComponent} from '../whats-new/whats-new.component';
import { Preferences } from '@capacitor/preferences';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  showJournals = true;
  journals = [];
  journalsFromCache = [];
  cachedJournals = [];
  filteredJournal = [];
  currentPage = "Home";
  dateFormatted = [];
  journalContentFormatted = [];
  dateFormattedMemories = [];
  journalContentFormattedMemories = [];
  dateFormattedPrivates = [];
  journalContentFormattedPrivates = [];
  journalsLoaded: number;
  sortedJournals = [];
  showLoadmore = false;
  todaysDate = moment().format('dddd, MMMM Do');
  passcode: string;
  lastId: string;
  lockIcon = 'lock-closed-outline';
  lockDesc = 'Unlock';
  memories = [];
  private = [];
  menuLabel = false;
  disableClickCard = false;
  streakData = {lastDate: moment(), streak: 0};
  journalIndex = 0;
  fabPos = 1; // 0 start, 1 center, 2 end
  
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('searchbar') searchbar: IonSearchbar;

  constructor(private modalController: ModalController, private popoverController: PopoverController, private alertController: AlertController, private platform: Platform, private routerOutlet: IonRouterOutlet, private navCtrl: NavController, private nativeStorage: NativeStorage) { }

  async ngOnInit() {
    const tempHide2new = await Preferences.get({key: 'hide2new'});
    if (tempHide2new.value !== 'true') {
      this.showWhatsNew();
      await Preferences.set({key: 'hide2new', value: 'true'});
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

  async ionViewDidEnter() {
    this.checkMenuPlacement();

    this.platform.ready().then(() => {
      this.loadJournalView();
      this.loadStreakData();
      this.loadMenuPlacement();
    }).catch((err) => {
      console.log('Error loading platform: ' + JSON.stringify(err));
    });
  }

  async presentCardOptions(ev: any, journal: any) {
    const popover = await this.popoverController.create({
      component: CardQuickOptionsComponent,
      event: ev,
      translucent: true
    });
    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.openJournalPage('/tabs/journalView', journal, dataReturned.data);
      }
    });
    return await popover.present();
  }

  stripJournalContent(content) {
    const tagsToStrip = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'br'];
    for (const i in tagsToStrip) {
      content = content.replace(new RegExp('<' + tagsToStrip[i] + '.*>.*?<\/' + tagsToStrip[i] +  '>'), '');
      content = content.replace(/(<(\/)?(br|BR|Br|bR)>)|(<(\/)?(P|P)>)|(<(\/)?(P|P)>)/g, '');
    }
    return content.split('\n', 1)[0].trim();
  }

  customSort(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

  pushNext(parent, child) {
    if (child.length < parent.length) {
      child.push(parent[child.length]);
    }
  }

  async deleteJournal(data) {
    const contents = await Filesystem.readFile({
      path: 'Mirror-Journal-app/mirrorJournals.txt',
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    let outParsed = JSON.parse(contents.data);
    for (const i in outParsed) {
      if (outParsed.hasOwnProperty(i)) {
        if (outParsed[i].id === data.id) {
          outParsed = outParsed.filter(returnableObjects => returnableObjects.id !== data.id);
          try {
            await Filesystem.writeFile({
              path: 'Mirror-Journal-app/' + data.id + '.txt',
              data: JSON.stringify(outParsed),
              directory: Directory.Documents,
              encoding: Encoding.UTF8
            });
          } catch (e) {
            console.error('Unable to write file', e);
          }
        }
      }
    }
  }

  async loadJournalData(data) {
    const output = JSON.parse(data["data"]);
    /* tslint:disable:no-string-literal */
    if (!output['locked'] || (this.passcode !== undefined && output['locked'])) {
      if (output['locked']) {
        output['content'] = CryptoJS.AES.decrypt(output['content'], this.passcode).toString(CryptoJS.enc.Utf8);
        if (output['notes']) {
          output['notes'] = JSON.parse(CryptoJS.AES.decrypt(output['notes'], this.passcode).toString(CryptoJS.enc.Utf8));
        }
        if (!this.private.includes(output)) {
          this.dateFormattedPrivates.push(moment(output.date).format('LLLL'));
          this.journalContentFormattedPrivates.push(this.stripJournalContent(output.content));
          this.private.push(output);
        }
      }
      this.dateFormatted.push(moment(output.date).format('LLLL'));
      this.journalContentFormatted.push(this.stripJournalContent(output.content));
      this.journals.push(output);
      this.showJournals = this.journals.length > 0;
      return true;
    } else {
      return false;
    }
  }

  async loadMemory(id) { // TODO: Get from cache
    const contents = await Filesystem.readFile({
      path: 'Mirror-Journal-app/' + id + '.txt',
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    const output = JSON.parse(contents.data);
    /* tslint:disable:no-string-literal */
    if (!output['locked'] || (this.passcode !== undefined && output['locked'])) {
      if (output['locked']) {
        output['content'] = CryptoJS.AES.decrypt(output['content'], this.passcode).toString(CryptoJS.enc.Utf8);
        if (output['notes']) {
          output['notes'] = CryptoJS.AES.decrypt(output['notes'], this.passcode).toString(CryptoJS.enc.Utf8);
        }
      }
      output['id'] = id;
      this.dateFormattedMemories.push(moment(output.date).format('LLLL'));
      this.journalContentFormattedMemories.push(this.stripJournalContent(output.content));
      this.memories.push(output);
    }
  }

  async loadJournalCache() {
    try {
      const contents = await Filesystem.readFile({
        path: 'Mirror-Journal-app/mirrorJournalsCache.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      this.cachedJournals = contents.data ? JSON.parse(contents.data) : [];
    } catch (e) {
      this.cachedJournals = [];
      this.saveJournalCache();
    }
  }

  async loadJournalList() {
    try {
      const mirrorJournalListFile = await Filesystem.readFile({
        path: 'Mirror-Journal-app/mirrorJournals.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      alert(JSON.stringify(mirrorJournalListFile));

      this.sortedJournals = JSON.parse(mirrorJournalListFile.data);
    } catch (e) {
      console.error('file read err', e);
      this.createMirrorJournals();
      this.showJournals = false;
    }
  }

  async saveJournalCache() {
    await Filesystem.writeFile({
      path: 'Mirror-Journal-app/mirrorJournalsCache.txt',
      data: JSON.stringify(this.cachedJournals),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
  }

  async getNextJournalForCache() {
    if (this.journalIndex < this.sortedJournals.length - 1) {
      let nextJournal = this.sortedJournals[this.journalIndex];
      this.lastId = nextJournal.id;

      const contents = await Filesystem.readFile({
        path: 'Mirror-Journal-app/' + nextJournal.id + '.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      this.cachedJournals.push(contents);
      return true;
    }
    return false;
  }

  async loadJournals(numberToLoad) {
    let originalCachedJournals = JSON.parse(JSON.stringify(this.cachedJournals));
    if (this.sortedJournals.length >= this.journalsFromCache.length) {
      for (let i = 0; i < numberToLoad; i++) {
        if (this.journals.length >= this.sortedJournals.length) {
          break;
        }

        if (this.cachedJournals.length > this.journalsFromCache.length) {
          this.journalIndex++;
          this.pushNext(this.cachedJournals, this.journalsFromCache);
          const loaded = await this.loadJournalData(this.journalsFromCache[this.journalsFromCache.length - 1]);
         
          if (loaded) {
            this.journalsLoaded += 1;
          } else {
            i--;
          }
        } else {
          const getNextJournalForCacheValue = await this.getNextJournalForCache();
          i--;

          if (!getNextJournalForCacheValue) {
            break;
          }
        }
      }
    }

    this.showLoadmore = this.journalsLoaded < this.sortedJournals.length;

    if (this.cachedJournals != originalCachedJournals) {
      this.saveJournalCache();
    }
  }

  loadData(event) {
    setTimeout(() => {
      this.loadJournals(5);
      event.target.complete();

      if (!this.showLoadmore) {
        event.target.disabled = true;
      }
    }, 500);
  }

  async loadStreakData() {
    const dayBefore = moment().subtract(1, 'days');
    const tempStreak = await Preferences.get({key: 'streaks'});
    if (tempStreak.value) {
      this.streakData = JSON.parse(tempStreak.value);
      if (moment(this.streakData.lastDate).isBefore(dayBefore, 'day')) {
        this.streakData = { lastDate: moment(), streak: 0 };
        await Preferences.set({key: "streaks", value: JSON.stringify(this.streakData)});
      }
    }
  }

  async loadMenuPlacement() {
    const tempMenuLabel = await Preferences.get({key: 'menuLabel'});
    if (tempMenuLabel.value) {
      this.menuLabel = (tempMenuLabel.value === 'true');
    }
  }

  async createMirrorJournals() {
    try {
      await Filesystem.mkdir({
        path: 'Mirror-Journal-app',
        directory: Directory.Documents,
        recursive: false // like mkdir -p
      });
      try {
        await Filesystem.writeFile({
          path: 'Mirror-Journal-app/mirrorJournals.txt',
          data: '[]',
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        this.showWelcomeSceen();
      } catch (e) {
        console.error('Unable to write file', e);
      }
    } catch (e) {
      console.error('Unable to make directory', e);
    }
  }

  generateMemories(journals) {
    this.memories = [];
    for (const journal of journals) {
      if (journal.hideMemories != true) {
        if (moment().subtract(1, 'month').isSame(moment(journal.date), 'date')) {
          this.loadMemory(journal.id);
        } else if (moment().subtract(6, 'month').isSame(moment(journal.date), 'date')) {
          this.loadMemory(journal.id);
        } else if (moment().isSame(moment(journal.date), 'month') && moment().isSame(moment(journal.date), 'day') && !moment().isSame(moment(journal.date), 'year')) {
          this.loadMemory(journal.id);
        }
      }
    }
  }

  resetJouranl() {
    this.dateFormatted = [];
    this.journalContentFormatted = [];
    this.journals = [];
    this.journalsFromCache = [];
    this.filteredJournal = [];
    this.showJournals = false;
    this.journalsLoaded = 0;
    this.lastId = "";
    this.journalIndex = 0;
  }

  async resetFilteredJournal() {
    this.filteredJournal = [];
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 150);
  }

  async loadJournalView() {
    this.resetJouranl();
    await this.loadJournalCache();
    await this.loadJournalList();

    this.sortedJournals.sort((a, b) => {
      return Number(new Date(b.date)) - Number(new Date(a.date));
    });

    this.generateMemories(this.sortedJournals);
    this.loadJournals(5);
  }

  async showWelcomeSceen() {
    const modal = await this.modalController.create({
      component: WelcomeScreenComponent,
      backdropDismiss: false
    });
    await modal.present();
  }

  async showWhatsNew() {
    const modal = await this.modalController.create({
      component: WhatsNewComponent,
      backdropDismiss: false
    });
    await modal.present();
  }

  search(query) {
    this.filteredJournal = this.cachedJournals.filter(item => {
      return !JSON.parse(item.data).locked &&
        (JSON.parse(item.data).name.toLowerCase().includes(query.toLowerCase()) ||
        moment(JSON.parse(item.data).date).format('LLLL').toLowerCase().includes(query.toLowerCase()) ||
        JSON.parse(item.data).content.toLowerCase().includes(query.toLowerCase()));
    })
    .map(item => JSON.parse(item.data))
    .map(item => {
      return {
        ...item,
        date: moment(item.date).format('LLLL'),
        content: this.stripJournalContent(item.content)
      };
    });
  }

  ionViewWillLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  // example of adding a transition when pushing a new page
  openJournalPage(page: any, journalToNavigate: any, action= 'none') {
    Haptics.impact({style: ImpactStyle.Light});
    let navigationExtras: NavigationExtras;
    if (this.passcode !== undefined) {
      navigationExtras = {
        state: {
          journal: journalToNavigate,
          action: action,
          passcode: this.passcode
        }
      };
    } else {
      navigationExtras = {
        state: {
          journal: journalToNavigate,
          action: action
        }
      };
    }
    this.navCtrl.navigateForward(page, navigationExtras);
  }

  openPage(page: any) {
    Haptics.impact({style: ImpactStyle.Light});
    this.navCtrl.navigateForward(page).then(() => {}).catch(err => {
      console.log('Error openPage: ' + err);
    });
  }

  async checkMenuPlacement() {
    const tempMenuplacment = await Preferences.get({key: 'menuplacement'});
    if (tempMenuplacment.value) {
      this.fabPos = parseInt(tempMenuplacment.value);
    }
  }

  async openSettings() {
    Haptics.impact({style: ImpactStyle.Light});
    const modal = await this.modalController.create({
      component: SettingsComponent
    });
    modal.onDidDismiss().then(() => {
      this.passcode = undefined;
      this.lockIcon = 'lock-closed-outline';
      this.lockDesc = 'Unlock';
      this.loadJournalView();

      this.checkMenuPlacement();
    });
    return await modal.present();
  }

  async openPasswordDialog() {
    Haptics.notification({type: NotificationType.Warning});
    const modal = await this.modalController.create({
      component: PasswordDialogComponent
    });
    modal.onDidDismiss().then(dataReturned => {
      if (dataReturned !== null && dataReturned.data !== '') {
        this.passcode = dataReturned.data;
      }
      this.loadJournalView();
    });
    return await modal.present();
  }

  async askForPasscode(privatePage = false) {
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
            this.currentPage = 'Home';
            Haptics.impact({style: ImpactStyle.Light});
          }
        }, {
          text: 'Ok',
          handler: out => {
            if (CryptoJS.AES.decrypt(this.passcode, out.passcode).toString(CryptoJS.enc.Utf8) === 'passcode') {
              this.passcode = out.passcode;
              this.lockIcon = 'lock-open-outline';
              this.lockDesc = 'Lock';
              Haptics.notification({type: NotificationType.Success});
              this.loadJournalView();
            } else {
              this.passcode = undefined;
              Haptics.notification({type: NotificationType.Error});
              this.unlockLockJournals();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async unlockLockJournals(privatePage = false) {
    if (this.passcode === undefined) {
      const { value } = await Preferences.get({key: 'passcode' });
      if (value) {
        this.passcode = value;
        Haptics.impact({style: ImpactStyle.Light});
        this.askForPasscode(privatePage);
      } else {
        this.openPasswordDialog();
      }
    } else {
      this.passcode = undefined;
      this.lockIcon = 'lock-closed-outline';
      this.lockDesc = 'Unlock';
      this.loadJournalView();
    }
  }

  setSelectedPage(page: string) {
    this.currentPage = page;

    if (this.currentPage == "Private") {
      if (this.passcode === undefined) {
        this.unlockLockJournals(true);
      }
    }
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
