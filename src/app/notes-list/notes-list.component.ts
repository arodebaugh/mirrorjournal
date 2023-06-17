import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NewAnalyzeComponent} from '../new-analyze/new-analyze.component';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {
  @Input() notes = [];

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async trash(note) {
    await this.modalController.dismiss(note);
  }

  async dismiss() {
    await this.modalController.dismiss();
  }

  async createANote() {
    await this.modalController.dismiss(1);
  }

  async openNote(note) {
    const modal = await this.modalController.create({
      component: NewAnalyzeComponent,
      componentProps: {
        pickerName: note.name,
        data: note.data,
        newNote: false
      }
    });
    await modal.present();
  }
}
