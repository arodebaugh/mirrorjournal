import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent implements OnInit {
  @ViewChild('editor') editor: ElementRef;
  @ViewChild('decorate') decorate: ElementRef;
  @ViewChild('styler') styler: ElementRef;

  @Input() formControlItem: UntypedFormControl;

  @Input() placeholderText: string;

  private stringTools = {
    isNullOrWhiteSpace: (value: string) => {
      if (value == null) {
        return true;
      }
      value = value.replace(/[\n\r]/g, '');
      value = value.split(' ').join('');

      return value.length === 0;
    }
  };

  constructor() { }

  ngOnInit() {
    this.updateItem();
    this.wireupButtons();
    alert('test');
  }

  getPlaceholderText() {
    if (this.placeholderText !== undefined) {
      return this.placeholderText
    }
    return '';
  }

  // uniqueId = `editor${Math.floor(Math.random() * 1000000)}`;

  private updateItem() {
    const element = this.editor.nativeElement as HTMLDivElement;
    element.innerHTML = this.formControlItem.value;

    // if (element.innerHTML === null || element.innerHTML === '') {
    //   element.innerHTML = '<div></div>';
    // }

    const reactToChangeEvent = () => {

      if (this.stringTools.isNullOrWhiteSpace(element.innerText)) {
        element.innerHTML = '<div></div>';
        this.formControlItem.setValue(null);
      } else {
        this.formControlItem.setValue(element.innerHTML);
      }
    };

    element.onchange = () => reactToChangeEvent();
    element.onkeyup = () => reactToChangeEvent();
    element.onpaste = () => reactToChangeEvent();
    element.oninput = () => reactToChangeEvent();
  }

  private wireupButtons() {
    const buttons = (this.decorate.nativeElement as HTMLDivElement).getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];

      let command = button.getAttribute('data-command');

      if (command.includes('|')) {
        const parameter = command.split('|')[1];
        command = command.split('|')[0];

        button.addEventListener('click', () => {
          document.execCommand(command, false, parameter);
        });
      } else {
        button.addEventListener('click', () => {
          document.execCommand(command);
        });
      }
    }

  }

}
