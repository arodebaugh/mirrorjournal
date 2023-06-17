import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalViewPage } from './journal-view.page';

describe('JournalViewPage', () => {
  let component: JournalViewPage;
  let fixture: ComponentFixture<JournalViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
