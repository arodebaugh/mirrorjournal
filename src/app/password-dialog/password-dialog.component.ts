import { Component, OnInit } from '@angular/core';
import {ModalController, Platform, ToastController} from '@ionic/angular';
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss'],
})
export class PasswordDialogComponent implements OnInit {
  oldPasscodeInput = '';
  passcodeInput = '';
  passcodeReinput = '';
  passcodeSet = true;
  private encryptedPasscode: string;

  constructor(private modalController: ModalController, private platform: Platform, private toastController: ToastController, private nativeStorage: NativeStorage) { }

 ngOnInit() {
    this.platform.ready().then(() => {
      this.getPasscode();
    }).catch(err => {
      alert('Platform load error: ' + JSON.stringify(err));
    });
  }

  async getPasscode() {
    const { value } = await Preferences.get({key: 'passcode' });

    if (value) {
      this.passcodeSet = value ? true : false;
      this.encryptedPasscode = value;
    } else {
      this.passcodeSet = false;
    }
  }

  async dismiss() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.modalController.dismiss(this.passcodeInput);
  }

  async saveNewPassword() {
    const toast = await this.toastController.create({
      message: '',
      position: 'top',
      duration: 2000,
      color: 'danger'
    });
    if (this.passcodeInput === '') {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'Passcode is required!';
      toast.color = 'danger';
      await toast.present();
    } else if (this.passcodeReinput === '') {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'Passcode re-entry is required!';
      toast.color = 'danger';
      await toast.present();
    } else if (this.passcodeReinput !== this.passcodeInput) {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'Passcode re-entry is different than passcode!';
      toast.color = 'danger';
      this.passcodeReinput = '';
      await toast.present();
    } else {
      Haptics.notification({type: NotificationType.Success});
      toast.message = 'Saved!';
      toast.color = 'success';
      Preferences.set({ key: 'passcode', value: CryptoJS.AES.encrypt('passcode', this.passcodeInput).toString()}).then(() => {
        toast.present();
        this.dismiss();
      }).catch(err => {
        Haptics.notification({type: NotificationType.Warning});
        toast.message = 'Error! ' + JSON.stringify(err);
        toast.color = 'danger';
      });
    }
  }

  async readJournal(id) {
    return new Promise((resolve, reject) => {
      const fileName = 'Mirror-app/' + id + '.txt';
      Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      }).then(contents => {
        resolve(JSON.parse(contents.data));
      }).catch(err => {
        reject(err);
      });
    });
  }

  async saveJournal(id, data) {
    return new Promise((resolve, reject) => {
      const fileName = 'Mirror-app/' + id + '.txt';
      Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      }).then(() => {
        resolve(true);
      }).catch(err => {
        reject(err);
      });
    });
  }

  async resetPassword() {
    const toast = await this.toastController.create({
      message: '',
      position: 'top',
      duration: 2000,
      color: 'danger'
    });
    if (CryptoJS.AES.decrypt(this.encryptedPasscode, this.oldPasscodeInput).toString(CryptoJS.enc.Utf8) !== 'passcode') {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'Current passcode is wrong!';
      toast.color = 'danger';
      await toast.present();
    } else if (this.passcodeInput === '') {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'New passcode is required!';
      toast.color = 'danger';
      await toast.present();
    } else if (this.passcodeReinput === '') {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'New passcode re-entry is required!';
      toast.color = 'danger';
      await toast.present();
    } else if (this.passcodeReinput !== this.passcodeInput) {
      Haptics.notification({type: NotificationType.Warning});
      toast.message = 'New passcode re-entry is different than passcode!';
      toast.color = 'danger';
      this.passcodeReinput = '';
      await toast.present();
    } else {
      Haptics.notification({type: NotificationType.Success});
      toast.message = 'Saved!';
      toast.color = 'success';

      Filesystem.stat({
        path: 'Mirror-app/mirrorJournals.txt',
        directory: Directory.Documents
      }).then(() => {
        Filesystem.readFile({
          path: 'Mirror-app/mirrorJournals.txt',
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        }).then(out => {
          const journals = JSON.parse(out.data);
          for (const i in journals) {
            if (journals.hasOwnProperty(i)) {
              const read = this.readJournal(journals[i].id);
              read.then((output) => {
                /* tslint:disable:no-string-literal */
                if (output['locked']) {
                  output['content'] = CryptoJS.AES.decrypt(output['content'], this.oldPasscodeInput).toString(CryptoJS.enc.Utf8);
                  output['content'] = CryptoJS.AES.encrypt(output['content'], this.passcodeInput).toString();
                  this.saveJournal(journals[i].id, JSON.stringify(output)).then(() => {
                    if ((i + 1) >= journals.length) {
                      Preferences.set({key: 'passcode', value: CryptoJS.AES.encrypt('passcode', this.passcodeInput).toString()}).then(() => {
                        toast.present();
                        this.dismiss();
                      }).catch(err => {
                        toast.message = 'Error! ' + JSON.stringify(err);
                        toast.color = 'danger';
                      });
                    }
                  });
                }
              }).catch(err => {
                console.log('Error reading: ' + JSON.stringify(err));
              });
            }
          }
        }).catch(err => {
          console.log('Error reading: ' + JSON.stringify(err));
        });
      }).catch(err => {
        if (err.code !== 13 || err.code !== 1) {
          console.log('Error checking file: ' + JSON.stringify(err));
        }
      });
    }
  }

  savePassword() {
    if (this.passcodeSet) {
      this.resetPassword();
    } else {
      this.saveNewPassword();
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
