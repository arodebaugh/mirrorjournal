import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalHelpComponent } from './journal-help.component';

describe('JournalHelpComponent', () => {
  let component: JournalHelpComponent;
  let fixture: ComponentFixture<JournalHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalHelpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
