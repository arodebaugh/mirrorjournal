import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-card-quick-options',
  templateUrl: './card-quick-options.component.html',
  styleUrls: ['./card-quick-options.component.scss'],
})
export class CardQuickOptionsComponent implements OnInit {

  constructor( public popoverController: PopoverController) { }

  ngOnInit() {}

  editEntry() {
    Haptics.impact({style: ImpactStyle.Light});
    this.popoverController.dismiss('edit');
  }

  deleteEntry() {
    Haptics.impact({style: ImpactStyle.Light});
    this.popoverController.dismiss('delete');
  }

  createNote() {
    Haptics.impact({style: ImpactStyle.Light});
    this.popoverController.dismiss('create');
  }
}
