import { Component, Input, OnInit } from '@angular/core';
import { AppIcon } from '@capacitor-community/app-icon';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-icon',
  templateUrl: './custom-icon.component.html',
  styleUrls: ['./custom-icon.component.scss'],
})
export class CustomIconComponent {
  @Input() icons: any[];
  @Input() currentIcon: string;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async changeIcon(iconName: string) {
    try {
      await AppIcon.change({ name: iconName, suppressNotification: false });
      this.modalCtrl.dismiss();
    } catch (e) {
      alert('Failed to change app icon ' + e);
    }
  }
}
