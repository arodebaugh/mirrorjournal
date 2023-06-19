import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Filesystem } from '@capacitor/filesystem';


const PRODUCT_PRO_KEY = 'mirrorjournalpro';

@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss'],
})
export class WelcomeScreenComponent implements OnInit {
  @ViewChild('swiper') slide: ElementRef | undefined;
  viewEntered = false;
  last = false;
  isPro = false;
  proListing: any;

  constructor(private platform: Platform, private alertController: AlertController, private modalController: ModalController, private ref: ChangeDetectorRef) { }

  async ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
      this.last = false;
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
    this.slide?.nativeElement.swiper.slideNext();
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

  syncFromOldMirrorJournal() {
    // todo: make this whole process nicer.
    let warn = confirm("This version of Mirror Journal syncs with iCloud. Do you want to move your journals to iCloud? This is required to see them.");
    if (warn) {
      Filesystem.syncToDrive({}).then(()=> {
        alert("Success!");
      }).catch(err => {
        alert("There was an error: " + JSON.stringify(err))
      });
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    setTimeout(() => {
          if (this.slide) {
            // this.slide.update();
          }
        }, 300);
  }
}
