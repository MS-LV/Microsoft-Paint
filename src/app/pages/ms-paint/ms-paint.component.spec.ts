import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsPaintComponent } from './ms-paint.component';

describe('MsPaintComponent', () => {
  let component: MsPaintComponent;
  let fixture: ComponentFixture<MsPaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsPaintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsPaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
