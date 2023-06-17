import {Component, Input, OnInit} from '@angular/core';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import * as moment from 'moment';
import {split} from 'ts-node';

@Component({
  selector: 'app-new-analyze',
  templateUrl: './new-analyze.component.html',
  styleUrls: ['./new-analyze.component.scss'],
})
export class NewAnalyzeComponent implements OnInit {
  @Input() pickerName: string;
  @Input() data = [{text: '', highlight: false, note: ''}];
  @Input() newNote: boolean;
  noteData = [{text: [], highlight: false, note: ''}];
  dataString: string;
  toast: any;

  constructor(private modalCtrl: ModalController, private alertController: AlertController, private toastController: ToastController) { }

  async presentTip() {
    this.toast = await this.toastController.create({
      header: '💡 Tip',
      message: 'Click on words to highlight them to take notes on your journal.',
      color: 'warning',
      position: 'bottom',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await this.toast.present();
  }

  ngOnInit() {
    const allTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'i', 'strike', 'u', 'b', 'p'];
    console.log(this.newNote);
    if (this.newNote) {
      this.noteData = [];
      let splitText = this.data['content'].replaceAll('<', ' <') .replaceAll('>', '> ').split(' ');
      splitText = splitText.filter(e => e !== '');
      const newText = [];
      console.log(JSON.stringify(splitText));
      const styles = [];
      splitText.forEach((item, index) => {
        if (item.includes('</') && item.includes('>')) {
          const tag = item.replace('</', '').replace('>', '');
          console.log('end: ' + JSON.stringify(styles));
          if (styles.includes(tag)) {
            styles.splice(styles.indexOf(tag), 1);
            splitText[index] = item.replace('</' + tag + '>', '');
          }
        } else if (item.includes('<') && item.includes('>')) {
          const tag = item.replace('<', '').replace('>', '');
          if (allTags.includes(tag) && !styles.includes(tag)) {
            styles.push(tag);
            splitText[index] = item.replace('<' + tag + '>', '');
          }
        }

        for (const i in styles) {
          if (styles[i].includes('h')) {
            splitText[index] = '<b class="' + styles[i] + '">' + splitText[index] + '</b>';
          } else {
            splitText[index] = '<' + styles[i] + '>' + splitText[index] + '</' + styles[i] + '>';
          }
        }
      });
      this.noteData = [{text: splitText, highlight: false, note: ''}];
      this.dataString = splitText;
    } else {
      // @ts-ignore
      this.noteData = this.data;
    }
    this.presentTip();
  }

  async dismiss() {
    await this.toast.dismiss();
    await this.modalCtrl.dismiss();
  }

  async save() {
    const alert = await this.alertController.create({
      header: 'Title',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'My Note'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (out) => {
            this.toast.dismiss();
            this.pickerName = out.title;
            const saveData = {
              name: this.pickerName,
              data: this.noteData,
              date: moment().format('LLLL')
            };
            this.modalCtrl.dismiss(saveData);
          }
        }
      ]
    });

    if (this.newNote) {
      await alert.present();
    } else {
      const saveData = {
        name: this.pickerName,
        data: this.noteData,
        date: moment().format('LLLL')
      };
      await this.modalCtrl.dismiss(saveData);
    }
  }

  replaceAtIndex(array, index, content) {
    const newArray = array;
    newArray[index] = content;
    return newArray;
  }

  insertAtIndex(array, index, content) {
    const newArray = array;
    newArray.splice(index, 0, content);
    return newArray;
  }

  insertBeforeIndex(array, index, content) {
    if (index === 0) {
      return this.insertAtIndex(array, index, content);
    } else {
      return this.insertAtIndex(array, index - 1, content);
    }
  }

  insertAfterIndex(array, index, content) {
    return this.insertAtIndex(array, index + 1, content);
  }

  removeIndex(array, index) {
    let firstArray = [];
    if (index !== 0) {
      firstArray = this.getLeftSide(array, index);
    }
    const secondArray = this.getRightSide(array, index);
    return firstArray.concat(secondArray);
  }

  getLeftSide(array, index) {
    return array.slice(0, index);
  }

  getRightSide(array, index) {
    return array.slice(index + 1, array.length);
  }

  makeNewSplit(dataIndex, textIndex, end = false) {
    const set = this.noteData[dataIndex].text[textIndex];
    const leftSide = this.getLeftSide(this.noteData[dataIndex].text, textIndex);
    const rightSide = this.getRightSide(this.noteData[dataIndex].text, textIndex);
    this.noteData = this.replaceAtIndex(this.noteData, dataIndex, {text: [set], highlight: true, note: ''});
    if (leftSide.length === 0) {
      if (rightSide.length > 0) {
        this.noteData = this.insertAfterIndex(this.noteData, dataIndex, {text: rightSide, highlight: false, note: ''});
        console.log('right: ' + JSON.stringify(this.noteData));
      }
    } else {
      if (end) {
        this.noteData = this.insertBeforeIndex(this.noteData, dataIndex + 1, {text: leftSide, highlight: false, note: ''});
      } else {
        this.noteData = this.insertBeforeIndex(this.noteData, dataIndex, {text: leftSide, highlight: false, note: ''});
      }
       if (rightSide.length > 0) {
        this.noteData = this.insertAfterIndex(this.noteData, dataIndex + 1, {text: rightSide, highlight: false, note: ''});
      }
    }
  }

  combineAtLeftIndex(dataIndex, textIndex) {
    this.noteData[dataIndex - 1].text.push(this.noteData[dataIndex].text[textIndex]);
    this.noteData[dataIndex].text = this.removeIndex(this.noteData[dataIndex].text, textIndex);
  }

  combineAtRightIndex(dataIndex, textIndex) {
    this.noteData[dataIndex + 1].text.unshift(this.noteData[dataIndex].text[textIndex]);
    this.noteData[dataIndex].text = this.removeIndex(this.noteData[dataIndex].text, textIndex);
  }

  combineAtBothIndex(dataIndex, textIndex) {
    // this.combineAtRightIndex(dataIndex, textIndex);
    let data = this.noteData[dataIndex - 1].text.concat(this.noteData[dataIndex].text);
    data = data.concat(this.noteData[dataIndex + 1].text);
    this.noteData = this.removeIndex(this.noteData, dataIndex + 1);
    this.noteData = this.removeIndex(this.noteData, dataIndex);
    this.noteData[dataIndex - 1].text = data;
  }

  releasePressEvent(dataIndex, textIndex) {
    if (this.noteData[dataIndex].highlight) {
      // Confirm remove highlight if text is in the notes.
      // todo
      if (dataIndex > 0) {
        if (dataIndex + 1 === this.noteData.length) {
          if (!this.noteData[dataIndex - 1].highlight && (textIndex === 0)) {
            this.combineAtBothIndex(dataIndex, textIndex);
          } else {
            this.noteData[dataIndex].highlight = false;
          }
        } else {
          if ((!this.noteData[dataIndex - 1].highlight && (textIndex === 0)) && (!this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length))) {
            this.combineAtBothIndex(dataIndex, textIndex);
          } else if (!this.noteData[dataIndex - 1].highlight && (textIndex === 0)) {
            this.combineAtLeftIndex(dataIndex, textIndex);
          } else if (!this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length)) {
            this.combineAtRightIndex(dataIndex, textIndex);
          } else {
            this.noteData[dataIndex].highlight = false;
          }
        }
      } else {
        if (this.noteData.length === 1) {
          this.noteData[dataIndex].highlight = false;
        } else {
          if (!this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length)) {
            this.combineAtRightIndex(dataIndex, textIndex);
          } else {
            this.noteData[dataIndex].highlight = false;
          }
        }
      }
    } else {
      // Todo: I think all of this can be simplified/optimised
      if (dataIndex > 0) {
        if (dataIndex + 1 === this.noteData.length) {
          if (this.noteData[dataIndex - 1].highlight && (textIndex === 0)) {
            this.combineAtLeftIndex(dataIndex, textIndex);
          } else {
            this.makeNewSplit(dataIndex, textIndex, true);
          }
        } else {
          if ((this.noteData[dataIndex - 1].highlight && (textIndex === 0)) && (this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length))) {
            if (this.noteData[dataIndex - 1].note === '' && this.noteData[dataIndex + 1].note === '') {
              this.combineAtBothIndex(dataIndex, textIndex);
            } else if (this.noteData[dataIndex - 1].note !== '' && this.noteData[dataIndex + 1].note !== '') {
              this.makeNewSplit(dataIndex, textIndex);
            } else if (this.noteData[dataIndex - 1].note !== '') {
              this.combineAtRightIndex(dataIndex, textIndex);
            } else {
              this.combineAtLeftIndex(dataIndex, textIndex);
            }
          } else if (this.noteData[dataIndex - 1].highlight && (textIndex === 0)) {
            this.combineAtLeftIndex(dataIndex, textIndex);
          } else if (this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length)) {
            this.combineAtRightIndex(dataIndex, textIndex);
          } else {
            this.makeNewSplit(dataIndex, textIndex);
          }
        }
      } else {
        if (this.noteData.length === 1) {
          this.makeNewSplit(dataIndex, textIndex);
        } else {
          if (this.noteData[dataIndex + 1].highlight && (textIndex + 1 === this.noteData[dataIndex].text.length)) {
            this.combineAtRightIndex(dataIndex, textIndex);
          } else {
            this.makeNewSplit(dataIndex, textIndex);
          }
        }
      }
    }
    this.dataString = JSON.stringify(this.noteData);
  }
}
