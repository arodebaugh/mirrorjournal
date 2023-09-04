import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AlertController, ModalController, Platform} from '@ionic/angular';
import {PasswordDialogComponent} from '../password-dialog/password-dialog.component';
import {WelcomeScreenComponent} from '../welcome-screen/welcome-screen.component';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import * as moment from 'moment';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AppRate } from '@awesome-cordova-plugins/app-rate/ngx';
import {ThemeWatchService} from '../theme-watch.service';
import {WhatsNewComponent} from '../whats-new/whats-new.component';
import { Preferences } from '@capacitor/preferences';
import { Filesystem } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

const PRODUCT_PRO_KEY = 'mirrorjournalpro';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  menuLabel = false;
  notifications = false;
  autosave = true;
  authType = 'FaceID';
  secureWithID = false;
  pro = false;
  time = new Date(new Date().setHours(Number('17:00'.split(':')[0]), Number('17:00'.split(':')[1]))).toISOString();


  theme = 'default';
  menuplacment = '1';

  constructor(private platform: Platform, private appRate: AppRate, private alertController: AlertController,  private ref: ChangeDetectorRef, private modalController: ModalController, private emailComposer: EmailComposer, private themeWatch: ThemeWatchService) { }

  async ngOnInit() {
    const tempMenuLabel = await Preferences.get({key: 'menuLabel'});
    if (tempMenuLabel.value) {
      this.menuLabel = (tempMenuLabel.value === 'true');
    }

    const tempAutosave = await Preferences.get({key: 'autosave'});
    if (tempAutosave.value) {
      this.autosave = (tempAutosave.value === 'true');
    } else {
      await Preferences.set({key: 'autosave', value: 'true'});
    }

    const tempTheme = await Preferences.get({key: 'theme'});
    if (tempTheme.value) {
      this.theme = tempTheme.value;
    }

    const tempMenuplacement = await Preferences.get({key: 'menuplacement'});
    if (tempMenuplacement.value) {
      this.menuplacment = tempMenuplacement.value;
    }
  }

  async whatsNew() {
    const modal = await this.modalController.create({
      component: WhatsNewComponent,
      backdropDismiss: false
    });
    await modal.present();
  }

  rate() {
    // TODO: Need to figure out or find new plugin.
    alert("TODO");
    /*this.appRate.setPreferences({
      displayAppName: 'Mirror Journal',
      callbacks: {
        handleNegativeFeedback() {
          this.contactUs();
        },
        ios: '1524166698'
      })
    this.appRate.preferences = {
      displayAppName: 'Mirror Journal',
      callbacks: {
        handleNegativeFeedback() {
          this.contactUs();
        }
      }
    };
    this.appRate.preferences.storeAppURL = {
      ios: '1524166698'
    };
    this.appRate.promptForRating(true);*/
  }

  privacyPolicy() {
    window.open('https://github.com/CosmicWebServices/Mirror-Privacy-Policy/blob/master/README.md');
  }

  async dismiss() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.modalController.dismiss();
  }

  async showWelcomeSceen() {
    Haptics.impact({style: ImpactStyle.Light});
    const modal = await this.modalController.create({
      component: WelcomeScreenComponent,
      backdropDismiss: false
    });
    await modal.present();
  }

  async changeLockCode() {
    Haptics.impact({style: ImpactStyle.Light});
    const modal = await this.modalController.create({
      component: PasswordDialogComponent
    });
    return await modal.present();
  }

  contactUs() {
    Haptics.impact({style: ImpactStyle.Light});
    window.open("https://forms.gle/JoK62zj9ENuzQCYe7");
    /*const email = {
      to: 'help@mirrorjournal.app',
      subject: 'Mirror App Contact on ' + moment().format('LLLL'),
      body: '',
      isHtml: true
    };
    this.emailComposer.open(email);*/
  }

  async customIcon() {
    alert('hey');
  }

  async deleteCache() {
    await Filesystem.deleteFile({
      path: 'Mirror-app/mirrorJournalsCache.txt',
      directory: Directory.Documents
    });

    alert("Deleted!");
  }

  async saveMenuLabel() {
    await Preferences.set({key: 'menuLabel', value: String(this.menuLabel)});
  }

  async changeTheme() {
    await Preferences.set({key: 'theme', value: String(this.theme)});
    this.themeWatch.change(this.theme);
  }

  async changeMenuplacement() {
    await Preferences.set({key: 'menuplacement', value: String(this.menuplacment)});
  }

  async schedule() {
    LocalNotifications.schedule({ notifications: [
      {
        id: 1,
        title: 'Mirror Journal',
        body: '👋 It\'s your scheduled journaling time!',
        schedule: { allowWhileIdle: true, on: { hour: parseInt(this.time.split(':')[0]), minute: parseInt(this.time.split(':')[1]) } }
      }
    ]
    });
  }

  async setNotifications(out) {
    this.notifications = out.value;

    const permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'denied') {
        await LocalNotifications.requestPermissions();
    }

    alert(this.notifications);

    if (this.notifications) {
      this.schedule();
    } else {
      LocalNotifications.cancel({ notifications: [{id: 1}]});
    }
  }

  async setAutosave() {
    if (this.autosave === true) {
      await Preferences.set({key: 'autosave', value: 'true'});
    } else {
      await Preferences.set({key: 'autosave', value: 'false'});
    }
  }

  syncFromOldMirrorJournal() {
    let warn = confirm("Warning: This may replace any journals in your iCloud Drive! Proceed with caution.");
    if (warn) {
      Filesystem.syncToDrive({}).then(()=> {
        alert("Success!")
      }).catch(err => {
        alert("There was an error: " + JSON.stringify(err))
      });
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
