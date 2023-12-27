import {Component, OnInit} from '@angular/core';
import { ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';


@Component({
  selector: 'app-credits-page',
  templateUrl: './credits-page.component.html',
  styleUrls: ['./credits-page.component.scss'],
})
export class CreditsPageComponent implements OnInit {
  viewEntered = false;

  constructor(private platform: Platform, private modalController: ModalController, private iab: InAppBrowser) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
    });
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

  openLink(url: string) {
    const browser = this.iab.create(url, '_system');
  }
}
