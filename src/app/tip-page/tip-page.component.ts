import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { AlertController, ModalController, Platform} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IAPProduct, InAppPurchase2 } from "@awesome-cordova-plugins/in-app-purchase-2/ngx";

const PRODUCT_TIP_TIER_1 = 'TipTier1';
const PRODUCT_TIP_TIER_2 = 'TipTier2';
const PRODUCT_TIP_TIER_3 = 'TipTier3';

@Component({
  selector: 'app-tip-page',
  templateUrl: './tip-page.component.html',
  styleUrls: ['./tip-page.component.scss'],
})
export class TipPageComponent implements OnInit {
  viewEntered = false;
  products: IAPProduct[] = [];
  ownsTipTier1 = false;
  ownsTipTier2 = false;
  ownsTipTier3 = false;

  constructor(private platform: Platform, private modalController: ModalController, private store: InAppPurchase2, private ref: ChangeDetectorRef, private alertController: AlertController) { 
    this.platform.ready().then(() => {
      // Only for debugging!
      this.store.verbosity = this.store.DEBUG;

      this.registerProducts();
      this.setupListeners();

      // Get the real product information
      this.store.ready(() => {
        this.products = this.store.products;
        this.ref.detectChanges();
      });
    });
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
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

  purchase(product: IAPProduct) {
    this.store.order(product).then(p => {
      // Purchase in progress!
    }, e => {
      this.presentAlert('Failed', `Failed to purchase: ${e}`);
    });
  }

  restore() {
    this.store.refresh();
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async close() {
    Haptics.impact({style: ImpactStyle.Light});
    this.viewEntered = false;
    await this.modalController.dismiss();
  }

}
