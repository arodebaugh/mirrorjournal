import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotesListComponent } from './notes-list.component';

describe('NotesListComponent', () => {
  let component: NotesListComponent;
  let fixture: ComponentFixture<NotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotesListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
