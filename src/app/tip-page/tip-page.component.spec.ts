import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TipPageComponent } from './tip-page.component';

describe('TipPageComponent', () => {
  let component: TipPageComponent;
  let fixture: ComponentFixture<TipPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TipPageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TipPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
