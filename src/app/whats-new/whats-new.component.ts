import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss'],
})
export class WhatsNewComponent implements OnInit {
  @ViewChild('swiper') slide: ElementRef | undefined;
  viewEntered = false;

  constructor(private platform: Platform, private modalController: ModalController) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
      // this.slide.update();
      // this.slide?.nativeElement.swiper.lockSwipes();
    });
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    //this.slide?.nativeElement.swiper.activeIndex = 0;
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

}
