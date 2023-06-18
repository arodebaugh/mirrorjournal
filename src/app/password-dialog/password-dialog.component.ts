import { Component, OnInit } from '@angular/core';
import {ModalController, Platform, ToastController} from '@ionic/angular';
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
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
