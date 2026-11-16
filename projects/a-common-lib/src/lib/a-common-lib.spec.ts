import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACommonLib } from './a-common-lib';

describe('ACommonLib', () => {
  let component: ACommonLib;
  let fixture: ComponentFixture<ACommonLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ACommonLib],
    }).compileComponents();

    fixture = TestBed.createComponent(ACommonLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
