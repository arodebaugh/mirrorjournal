import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonSlides, ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


const PRODUCT_PRO_KEY = 'mirrorjournalpro';

@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss'],
})
export class WelcomeScreenComponent implements OnInit {
  @ViewChild(IonSlides) slide: IonSlides;
  viewEntered = false;
  last = false;
  isPro = false;
  proListing: any;

  constructor(private platform: Platform, private alertController: AlertController, private modalController: ModalController, private ref: ChangeDetectorRef) { }

  async ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
      this.last = false;
      this.slide.update();
      this.slide.lockSwipes(true);
    });
  }
  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }


  async next() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.slide.lockSwipes(false);
    await this.slide.slideNext();
    await this.slide.lockSwipes(true);
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.slide.slideTo(0);
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    setTimeout(() => {
          if (this.slide) {
            this.slide.update();
          }
        }, 300);
  }
}
