import { Component } from '@angular/core';

import { IonicModule, Platform } from '@ionic/angular';
import { ThemeWatchService } from './theme-watch.service';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';

const PRODUCT_TIP_TIER_1 = 'TipTier1';
const PRODUCT_TIP_TIER_2 = 'TipTier2';
const PRODUCT_TIP_TIER_3 = 'TipTier3';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  theme: string;
  constructor(
    private platform: Platform,
    private store: InAppPurchase2,
    private themeWatch: ThemeWatchService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
      IonicModule.forRoot({
        swipeBackEnabled: true
      });
      this.registerProducts();
    });

    const tempTheme = await Preferences.get({key: 'theme'});
    if (tempTheme) {
      this.theme = tempTheme.value;
    }

    this.themeWatch.getEmittedValue().subscribe(item => {
      this.theme = item;
    });

    const preferredZoom = await TextZoom.getPreferred();
    await TextZoom.set({ value: preferredZoom.value });
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
}
