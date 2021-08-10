import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeaderContainerComponent } from './app-header-container.component';

describe('AppHeaderContainerComponent', () => {
  let component: AppHeaderContainerComponent;
  let fixture: ComponentFixture<AppHeaderContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppHeaderContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeaderContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
