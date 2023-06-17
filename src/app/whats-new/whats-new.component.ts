import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides, ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss'],
})
export class WhatsNewComponent implements OnInit {
  @ViewChild(IonSlides) slide: IonSlides;
  viewEntered = false;

  constructor(private platform: Platform, private modalController: ModalController) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
      this.slide.update();
      this.slide.lockSwipes(true);
    });
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    await this.slide.slideTo(0);
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

}
