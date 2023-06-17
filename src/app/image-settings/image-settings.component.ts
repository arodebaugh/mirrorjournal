import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-image-settings',
  templateUrl: './image-settings.component.html',
  styleUrls: ['./image-settings.component.scss'],
})
export class ImageSettingsComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  changeImage() {
    Haptics.impact({style: ImpactStyle.Light});
    this.popoverController.dismiss('change');
  }

  deleteImage() {
    Haptics.impact({style: ImpactStyle.Light});
    this.popoverController.dismiss('delete');
  }
}
