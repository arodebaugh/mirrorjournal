import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalNewPage } from './journal-new.page';

describe('JournalNewPage', () => {
  let component: JournalNewPage;
  let fixture: ComponentFixture<JournalNewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalNewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
