import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintIndexComponent } from './print-index.component';

describe('PrintIndexComponent', () => {
  let component: PrintIndexComponent;
  let fixture: ComponentFixture<PrintIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
