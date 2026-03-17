import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { OrderCreate } from './order-create';

describe('OrderCreate', () => {
  let component: OrderCreate;
  let fixture: ComponentFixture<OrderCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCreate],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
