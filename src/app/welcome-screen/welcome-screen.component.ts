import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, Platform, PopoverController, ToastController} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Filesystem } from '@capacitor/filesystem';
import { CardQuickOptionsComponent } from '../card-quick-options/card-quick-options.component';


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
  cachedJournals = [];
  sortedJournals = [];

  constructor(private toastController: ToastController, private platform: Platform, private alertController: AlertController, private popoverController: PopoverController, private modalController: ModalController, private ref: ChangeDetectorRef) { }

  async ngOnInit() {
    this.platform.ready().then(() => {
      this.viewEntered = true;
      this.last = false;
    });
  }

  async presentCardOptions(ev: any) {
    const popover = await this.popoverController.create({
      component: CardQuickOptionsComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
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

  async getAllJournalsForCache() {
    const mirrorJournalListFile = await Filesystem.readFile({
      path: 'Mirror-Journal-app/mirrorJournals.txt',
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    this.sortedJournals = JSON.parse(mirrorJournalListFile.data as string);

    for (let i = 0; i < this.sortedJournals.length; i++) {
      let nextJournal = this.sortedJournals[i];

      const contents = await Filesystem.readFile({
        path: 'Mirror-Journal-app/' + nextJournal.id + '.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      this.cachedJournals.push(contents);
    }

    await Filesystem.writeFile({
      path: 'Mirror-Journal-app/mirrorJournalsCache.txt',
      data: JSON.stringify(this.cachedJournals),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
  }

  /*async syncFromOldMirrorJournal() {
    const successToast = await this.toastController.create({
      message: 'Transfer complete!',
      duration: 2000,
      color: "success"
    });

    const transferToast = await this.toastController.create({
      message: 'Transferring data from past Mirror Journal...',
      icon: 'cloud-download-outline'
    });

    transferToast.present();

    Filesystem.syncToDrive({}).then(()=> {
      this.getAllJournalsForCache().then(() => {
        transferToast.dismiss();
        successToast.present();
        this.close();
      }).catch(err => {
        alert("There was an error: " + JSON.stringify(err))
        this.close();
      });
    }).catch(err => {
      alert("There was an error: " + JSON.stringify(err))
      this.close();
    });
  }*/

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    setTimeout(() => {
          if (this.slide) {
            // this.slide.update();
          }
        }, 300);
  }
}

// Definitions that were not importing correctly from Filesystem
enum Directory {
  /**
   * The Documents directory
   * On iOS it's the app's documents directory.
   * Use this directory to store user-generated content.
   * On Android it's the Public Documents folder, so it's accessible from other apps.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * It's not accesible on Android 11 or newer.
   *
   * @since 1.0.0
   */
  Documents = "DOCUMENTS",
  /**
   * The Data directory
   * On iOS it will use the Documents directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  Data = "DATA",
  /**
   * The Library directory
   * On iOS it will use the Library directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.1.0
   */
  Library = "LIBRARY",
  /**
   * The Cache directory
   * Can be deleted in cases of low memory, so use this directory to write app-specific files
   * that your app can re-create easily.
   *
   * @since 1.0.0
   */
  Cache = "CACHE",
  /**
   * The external directory
   * On iOS it will use the Documents directory
   * On Android it's the directory on the primary shared/external
   * storage device where the application can place persistent files it owns.
   * These files are internal to the applications, and not typically visible
   * to the user as media.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  External = "EXTERNAL",
  /**
   * The external storage directory
   * On iOS it will use the Documents directory
   * On Android it's the primary shared/external storage directory.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * It's not accesible on Android 11 or newer.
   *
   * @since 1.0.0
   */
  ExternalStorage = "EXTERNAL_STORAGE"
}
enum Encoding {
  /**
   * Eight-bit UCS Transformation Format
   *
   * @since 1.0.0
   */
  UTF8 = "utf8",
  /**
   * Seven-bit ASCII, a.k.a. ISO646-US, a.k.a. the Basic Latin block of the
   * Unicode character set
   * This encoding is only supported on Android.
   *
   * @since 1.0.0
   */
  ASCII = "ascii",
  /**
   * Sixteen-bit UCS Transformation Format, byte order identified by an
   * optional byte-order mark
   * This encoding is only supported on Android.
   *
   * @since 1.0.0
   */
  UTF16 = "utf16"
}
