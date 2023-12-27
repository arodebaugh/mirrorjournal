import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AppIcon } from '@capacitor-community/app-icon';
import { ModalController, Platform } from '@ionic/angular';
import { IAPProduct, InAppPurchase2 } from "@awesome-cordova-plugins/in-app-purchase-2/ngx";
import { TipPageComponent } from '../tip-page/tip-page.component';

const PRODUCT_TIP_TIER_1 = 'TipTier1';
const PRODUCT_TIP_TIER_2 = 'TipTier2';
const PRODUCT_TIP_TIER_3 = 'TipTier3';

@Component({
  selector: 'app-custom-icon',
  templateUrl: './custom-icon.component.html',
  styleUrls: ['./custom-icon.component.scss'],
})
export class CustomIconComponent {
  @Input() icons: any[];
  @Input() currentIcon: string;

  ownsTipTier1 = false;
  ownsTipTier2 = false;
  ownsTipTier3 = false;

  constructor(private platform: Platform, private modalCtrl: ModalController, private store: InAppPurchase2, private ref: ChangeDetectorRef, private modalController: ModalController) {
    this.platform.ready().then(() => {
      // Only for debugging!
      this.store.verbosity = this.store.DEBUG;

      this.registerProducts();
      this.setupListeners();

      // Get the real product information
      this.store.ready(() => {
        this.ref.detectChanges();
      });
    });
  }

  registerProducts() {
    this.store.register({
      id: PRODUCT_TIP_TIER_1,
      type: this.store.NON_CONSUMABLE,
    });

    this.store.register({
      id: PRODUCT_TIP_TIER_2,
      type: this.store.NON_CONSUMABLE,
    });

    this.store.register({
      id: PRODUCT_TIP_TIER_3,
      type: this.store.NON_CONSUMABLE,
    });

    this.store.refresh();
  }

  setupListeners() {
    this.store.when('product')
      .approved((p: IAPProduct) => {
        if (p.id === PRODUCT_TIP_TIER_1) {
          this.ownsTipTier1 = true;
        } else if (p.id === PRODUCT_TIP_TIER_2) {
          this.ownsTipTier2 = true;
        } else if (p.id === PRODUCT_TIP_TIER_3) {
          this.ownsTipTier3 = true;
        }

        this.ref.detectChanges();

        return p.verify();
      })
      .verified((p: IAPProduct) => p.finish());

    this.store.when(PRODUCT_TIP_TIER_1).owned((p: IAPProduct) => {
      this.ownsTipTier1 = true;
    });

    this.store.when(PRODUCT_TIP_TIER_2).owned((p: IAPProduct) => {
      this.ownsTipTier2 = true;
    });

    this.store.when(PRODUCT_TIP_TIER_3).owned((p: IAPProduct) => {
      this.ownsTipTier3 = true;
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async openTipPage() {
    const modal = await this.modalController.create({
      component: TipPageComponent,
      backdropDismiss: false
    });
    await modal.present();
  }

  async changeIcon(iconName: string) {
    if (this.ownsTipTier1 || this.ownsTipTier2 || this.ownsTipTier3) {
      try {
        await AppIcon.change({ name: iconName, suppressNotification: false });
        this.modalCtrl.dismiss();
      } catch (e) {
        alert('Failed to change app icon ' + e);
      }
    } else {
      this.openTipPage();
    }
  }
}
