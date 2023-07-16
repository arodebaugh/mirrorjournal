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
  time = '17:00';
  theme = 'default';
  fontsize = 'default';
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

    const tempFontsize = await Preferences.get({key: 'fontsize'});
    if (tempFontsize.value) {
      this.fontsize = tempFontsize.value;
    }
    const tempMenuplacement = await Preferences.get({key: 'menuplacement'});
    if (tempMenuplacement.value) {
      this.menuplacment = tempMenuplacement.value;
    }

    this.localNotifications.getScheduledIds().then(out => {
      if (out[0] === 1) {
        this.notifications = true;
        this.localNotifications.get(1).then(noti => {
          const minute = (noti.trigger.every['minute'].toString().length <= 1) ? '0' + noti.trigger.every['minute'].toString() : noti.trigger.every['minute'].toString();
          const hour = (noti.trigger.every['hour'].toString().length <= 1) ? '0' + noti.trigger.every['hour'].toString() : noti.trigger.every['hour'].toString();
          this.time = hour + ':' + minute;
        }).catch(err => {
          alert(JSON.stringify(err));
        });
      }
    });
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
    const email = {
      to: 'help@mirrorjournal.app',
      subject: 'Mirror App Contact on ' + moment().format('LLLL'),
      body: '',
      isHtml: true
    };
    this.emailComposer.open(email);
  }

  async customIcon() {
    alert('hey');
  }

  async saveMenuLabel() {
    await Preferences.set({key: 'menuLabel', value: String(this.menuLabel)});
  }

  async changeTheme() {
    await Preferences.set({key: 'theme', value: String(this.theme)});
    this.themeWatch.change(this.theme);
  }

  async changeFontsize() {
    await Preferences.set({key: 'fontsize', value: String(this.fontsize)});
  }

  async changeMenuplacement() {
    await Preferences.set({key: 'menuplacement', value: String(this.menuplacment)});
  }

  async schedule() {
    if (this.notifications) {
      LocalNotifications.schedule({
        id: 1,
        text: '👋 It\'s your scheduled journaling time!',
        trigger: { every: { hour: parseInt(this.time.split(':')[0]), minute: parseInt(this.time.split(':')[1]) } }
      });
    }
  }

  async setAutosave() {
    if (this.autosave === true) {
      await Preferences.set({key: 'autosave', value: 'true'});
    } else {
      await Preferences.set({key: 'autosave', value: 'false'});
    }
  }

  setNotifications() {
    this.localNotifications.hasPermission().then(out => {
      if (out) {
        this.schedule();
      } else {
        this.localNotifications.requestPermission().then(() => {
          this.schedule();
        }).catch(err => {
          alert('Error: ' + JSON.stringify(err));
        });
      }
    }).catch(err => {
      alert('Error: ' + JSON.stringify(err));
    });
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
