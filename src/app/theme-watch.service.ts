import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeWatchService {
  @Output() fire: EventEmitter<any> = new EventEmitter();
  theme: string;

  constructor() { }

  change(theme) {
    console.log('change started');
    this.theme = theme;
    this.fire.emit(theme);
  }

  getEmittedValue() {
    return this.fire;
  }
}
