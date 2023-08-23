import { Component } from '@angular/core';

import { IonicModule, Platform } from '@ionic/angular';
import { ThemeWatchService } from './theme-watch.service';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  theme: string;
  constructor(
    private platform: Platform,
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
}
